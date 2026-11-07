import { world, system, EntityComponentTypes } from "@minecraft/server";

const ORDERS = ["inferni", "tidemaker", "squaller", "durast", "alkemi", "healer", "heartrender"];
const cooldowns = new Map();
const parems = new Map();
const COLORS = { inferni: "red", tidemaker: "blue", squaller: "light_blue", durast: "purple", alkemi: "yellow", healer: "green", heartrender: "black" };

function affinity(player) { return player.getDynamicProperty("grishaverse:order"); }
function creative(player) {
  try { return player.getGameMode() === "creative"; } catch { return false; }
}
function tell(player, text) { player.sendMessage(`§8[§6Grisha§8] §r${text}`); }
function command(player, name) {
  try { player.runCommand(name); } catch { }
}
function effect(player, id, seconds, amplifier = 0) {
  try { player.addEffect(id, seconds * 20, { amplifier, showParticles: true }); } catch { }
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn || player.getDynamicProperty("grishaverse:awakened") !== undefined) return;
  player.setDynamicProperty("grishaverse:awakened", true);
  if (Math.floor(Math.random() * 139) === 0) {
    const order = ORDERS[Math.floor(Math.random() * ORDERS.length)];
    player.setDynamicProperty("grishaverse:order", order);
    tell(player, `The Small Science answers you. Your order is §${COLORS[order]}${order}§r.`);
  } else {
    tell(player, "You have no Grisha affinity. An affinity can only be claimed in Creative mode.");
  }
});

world.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity }) => {
  if (!sourceEntity || sourceEntity.typeId !== "minecraft:player") return;
  const player = sourceEntity;
  const args = message.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (id === "grisha:help") {
    tell(player, "Commands: grisha:power <order>, grisha:claim <order> (Creative), grisha:parem (Creative), grisha:plague (Creative).");
    return;
  }
  if (id === "grisha:claim") {
    const order = args[0];
    if (!creative(player)) return tell(player, "Only Creative players may claim an order.");
    if (!ORDERS.includes(order)) return tell(player, `Choose: ${ORDERS.join(", ")}.`);
    player.setDynamicProperty("grishaverse:order", order);
    player.setDynamicProperty("grishaverse:awakened", true);
    tell(player, `You claimed the order of ${order}.`);
    return;
  }
  if (id === "grisha:power") {
    const order = affinity(player);
    if (!order) return tell(player, "You have no Grisha affinity.");
    if (args[0] !== order) return tell(player, `Your order is ${order}; that power is not yours.`);
    const until = cooldowns.get(player.id) ?? 0;
    if (system.currentTick < until) return tell(player, `Your power is recovering for ${Math.ceil((until - system.currentTick) / 20)} seconds.`);
    const boosted = (parems.get(player.id) ?? 0) > system.currentTick;
    const duration = boosted ? 30 : 8;
    const strength = boosted ? 2 : 0;
    cooldowns.set(player.id, system.currentTick + (boosted ? 100 : 240));
    if (order === "inferni") { effect(player, "fire_resistance", duration); effect(player, "strength", duration, strength); command(player, "particle minecraft:basic_flame_particle ~~1~"); }
    if (order === "tidemaker") { effect(player, "water_breathing", duration); effect(player, "conduit_power", duration, strength); effect(player, "slow_falling", duration); }
    if (order === "squaller") { effect(player, "speed", duration, strength); effect(player, "jump_boost", duration, strength); effect(player, "slow_falling", duration); }
    if (order === "durast") { effect(player, "resistance", duration, strength); effect(player, "haste", duration, strength); }
    if (order === "alkemi") { effect(player, "strength", duration, strength); effect(player, "fire_resistance", duration); effect(player, "night_vision", duration); }
    if (order === "healer") { effect(player, "regeneration", boosted ? 20 : 6, strength); effect(player, "absorption", duration, strength); effect(player, "saturation", 1, 1); }
    if (order === "heartrender") { effect(player, "strength", duration, strength); effect(player, "resistance", duration, strength); effect(player, "night_vision", duration); }
    tell(player, boosted ? "Jurda parem surges through your power." : `You call on the Small Science: ${order}.`);
    return;
  }
  if (id === "grisha:parem") {
    if (!creative(player)) return tell(player, "Only Creative players may create jurda parem.");
    if (!affinity(player)) {
      player.kill();
      tell(player, "Your body cannot survive jurda parem.");
      return;
    }
    parems.set(player.id, system.currentTick + 600);
    command(player, "give @s grishaverse:jurda_parem 1");
    for (const amp of [["strength", 8], ["speed", 5], ["resistance", 3], ["regeneration", 3]]) effect(player, amp[0], 30, amp[1]);
    tell(player, "Jurda parem magnifies your power. The cost begins when it fades.");
    system.runTimeout(() => {
      if (!player.isValid) return;
      parems.delete(player.id);
      effect(player, "weakness", 1200, 2);
      effect(player, "nausea", 1200, 1);
      effect(player, "hunger", 1200, 3);
      tell(player, "The dose has faded. Your body is failing; another dose will not save you.");
      system.runTimeout(() => { if (player.isValid) { tell(player, "Jurda parem's lasting damage overwhelms you."); player.kill(); } }, 1200);
    }, 600);
    return;
  }
  if (id === "grisha:plague") {
    if (!creative(player)) return tell(player, "Only Creative players may start an outbreak.");
    let count = 0;
    for (const entity of player.dimension.getEntities({ location: player.location, maxDistance: 12 })) {
      if (entity.id === player.id || entity.typeId === "minecraft:player" || entity.typeId === "minecraft:item") continue;
      entity.setDynamicProperty("grishaverse:infected", true);
      count++;
    }
    tell(player, `A plague outbreak has begun among ${count} nearby creatures.`);
  }
});

system.runInterval(() => {
  for (const dimension of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
    for (const entity of dimension.getEntities()) {
      if (!entity.getDynamicProperty("grishaverse:infected")) continue;
      try { entity.addEffect("weakness", 100, { amplifier: 0, showParticles: true }); entity.addEffect("hunger", 100, { amplifier: 0, showParticles: true }); } catch { continue; }
      for (const nearby of dimension.getEntities({ location: entity.location, maxDistance: 3 })) {
        if (nearby.id !== entity.id && nearby.typeId !== "minecraft:player") nearby.setDynamicProperty("grishaverse:infected", true);
      }
    }
  }
}, 100);

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (itemStack.typeId === "grishaverse:jurda_parem") {
    if (!affinity(source)) { source.kill(); return; }
    if ((parems.get(source.id) ?? 0) > system.currentTick) return tell(source, "You are already under jurda parem's influence.");
    parems.set(source.id, system.currentTick + 600);
    for (const [id, amp] of [["strength", 8], ["speed", 5], ["resistance", 3], ["regeneration", 3]]) effect(source, id, 30, amp);
    tell(source, "The drug takes hold. Its aftermath will be lethal.");
    system.runTimeout(() => { if (!source.isValid) return; parems.delete(source.id); effect(source, "weakness", 1200, 2); effect(source, "nausea", 1200); effect(source, "hunger", 1200, 3); system.runTimeout(() => { if (source.isValid) source.kill(); }, 1200); }, 600);
  }
});
