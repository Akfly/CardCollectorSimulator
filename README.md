# CardCollectorSimulator

A game to simulate any card collection of any TCG.

# Development

This is still in its barebones, but if you want to download you will need:

- Node: The installation depends on your OS. This project uses version 22.9.0
- Angular: `npm install -g @angular/cli@18`
- Ionic: `npm install -g ionic@7.2.0`
- pnpm: `npm install -g pnpm`

After that, do a `pnpm i` to install all the packages in your node_modules

Then, before starting the project you have to build it (so it can read its files), do so with the followinf command: `ng build --configuration production`

After that, you can safely run it with: `ng serve --open`.

To run on Android Studio, first build the app:
`ng build --configuration production`
Then Sync with: `npx cap sync`
