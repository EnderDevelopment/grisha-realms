# Minecraft Bedrock Grishaverse Add-On

Grisha Realms is a Minecraft Bedrock add-on inspired by the Grishaverse, featuring Grisha powers, random 1-in-139 affinity awakening, Creative-mode order claiming, wearable keftas, themed items, plague mechanics, and dangerous jurda parem effects.

## Install

1. Package `Grishaverse_BP` and `Grishaverse_RP` separately as `.mcpack` files. Zip the contents of each folder with its `manifest.json` at the archive root, then change each `.zip` extension to `.mcpack`.
2. Import both `.mcpack` files into Minecraft Bedrock Edition.
3. Create or edit a world and activate both the Grishaverse Behavior Pack and Grishaverse Resources Pack.
4. Use Minecraft Bedrock 1.21.80 or a later compatible version with Script API `@minecraft/server` 2.0.0.
5. Enable cheats when using Creative-only commands. Enable Beta APIs if required by your Bedrock installation.
6. Join the world. On a player's first spawn, the add-on gives them a 1-in-139 chance to awaken with a random Grisha order. The result is saved for that world.

## Use

Use the following commands in chat:

- `/scriptevent grisha:help` displays the in-game command summary.
- `/scriptevent grisha:power <order>` activates your Grisha power.
- `/scriptevent grisha:claim <order>` claims an order in Creative mode.
- `/scriptevent grisha:parem` creates jurda parem in Creative mode.
- `/scriptevent grisha:plague` infects nearby non-player entities in Creative mode.

Valid orders are:

- `inferni`
- `tidemaker`
- `squaller`
- `durast`
- `alkemi`
- `healer`
- `heartrender`

A player can only activate the power matching their own order. Powers apply temporary effects with cooldowns, including fire resistance, strength, water breathing, conduit power, speed, jump boost, resistance, haste, night vision, regeneration, and absorption.

Use `/give @s grishaverse:<identifier>` to obtain items. Available identifiers include:

- `jurda`
- `jurda_parem`
- `kefta_red`
- `kefta_blue`
- `kefta_light_blue`
- `kefta_purple`
- `kefta_yellow`
- `kefta_green`
- `kefta_black`
- `kefta_pin`
- `small_knife`
- `ravkan_map`

The colored keftas are wearable chest items representing different Grisha orders. Jurda parem immediately kills players without a Grisha affinity. For Grisha, it temporarily boosts effects and power strength, then causes weakness, nausea, hunger, and eventual death after the dose fades.

The plague command infects nearby non-player entities. Infected entities receive weakness and hunger and can spread the infection to nearby non-player entities.

---

More Minecraft mod projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/40eb3e7a-80e5-4b31-bf02-14a5effde846?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=40eb3e7a-80e5-4b31-bf02-14a5effde846
