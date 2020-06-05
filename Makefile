run:
	deno run --allow-read  --allow-net --allow-write ./src/index.ts hsync --config=./config.json

install:
	deno install --allow-read  --allow-net --allow-write -n hsync ./src/index.ts

cache:
	deno cache ./src/index.ts

bundle:
	deno bundle ./src/index.ts ./hsync.js 