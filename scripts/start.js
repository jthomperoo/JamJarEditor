const { spawn } = require("child_process");
const chokidar = require('chokidar');

function runInstance() {
    console.log("Compiling frontend TypeScript...")
    const tscFront = spawn("webpack", ["--mode", "development"]);

    tscFront.stdout.on("data", (chunk) => {
        console.log(chunk.toString());
    });

    tscFront.stderr.on("data", (chunk) => {
        console.log(chunk.toString());
    });

    tscFront.on("close", (code) => {
        if (code != 0) {
            console.error(`Frontend TSC process exited with code ${code}`);
        } else {
            console.log("Frontend TypeScript compiled")
        }
        
        console.log("Compiling backend TypeScript...")
        const tscBack = spawn("tsc", ["--p", "tsconfig.backend.json"]);
    
        tscBack.stdout.on("data", (chunk) => {
            console.log(chunk.toString());
        });
    
        tscBack.stderr.on("data", (chunk) => {
            console.log(chunk.toString());
        });

        tscBack.on("close", (code) => {
            if (code != 0) {
                console.error(`TSC backend process exited with code ${code}`);
            } else {
                console.log("Backend TypeScript compiled")
            }
            const electron = spawn("electron", ["."], { env: {...process.env, MODE: "dev"} });
    
            electron.stdout.on("data", (chunk) => {
                console.log(chunk.toString());
            });
        
            electron.stderr.on("data", (chunk) => {
                console.log(chunk.toString());
            });
        
            electron.on("close", (code) => {
                console.log(`Electron process exited with code ${code}`);
            });
    
            const watcher = chokidar.watch('.', {
                ignored: ["node_modules/*", ".git/*", "lib/*", "scripts/*", "dist/*"],
                persistent: true,
                ignoreInitial: true
            });
    
            const restartInstance = (file) => {
                console.log(`Detected change in file "${file}", recompiling and restarting electron`);
                watcher.close();
                electron.kill();
                runInstance();
            };
    
            watcher.on('add', restartInstance)
                   .on('change', restartInstance);
        });
    })
}

runInstance();
