# InteractiveZygor

A guide viewer for Zygor guides.

## Current bugs

- Points in Stormwind are probably off
- Points like `goto Blasted Lands` without coordinates are missing. This should not be too much of an issue since another point with coordinates usually follows

## TODO

MVP :

- Draw arrows between markers

P1 :

- [ ] put guides in a side bar
- [ ] When you load a guide, arrows are created
- [ ] make it so that all steps are listed in a table, hover one / select one to highlight on the map
- [ ] add buttons to go to next step / previous step
  - [ ] adds the arrow to the map each time in highlighted fashion

Improvements :

- [ ] show details about the step instead of only the arrow
  - [ ] basically parse the entire guide but only render arrows for the movements
  - [ ] Requires to actually parse the guide so harder than just a regex
