## Changelog

#### v1.0.3 22-Feb-25

- fix: Potential solution for a reported game freeze by updating the map location on unload instead of load. [Source](https://www.nexusmods.com/kingdomcomedeliverance2/mods/831?tab=posts&jump_to_comment=150404516)

#### v1.0.2 22-Feb-25

- fix: Remove stale logging from production build.

#### v1.0.1 21-Feb-25

- fix: Mod conflict due to Lua file names not being unique across different mods.

#### v1.0.0 21-Feb-25

- feat: Save map position (zoom, X, Y) when closing the map.
- feat: Restore saved map position on opening the map.
- feat: Saves position after zooming or adding a checkpoint.
- note: Game bug - map movement doesn’t trigger save events; only zooming or adding a checkpoint does—use checkpoint to lock your view.
