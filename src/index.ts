import { cheerio, Command } from "./deps.ts";
import { configType } from "./config.ts";
import { start } from "./start.ts";

const program = new Command();

program
    .command("hsync")
    .option("-c, --config", "配置文件相对路径")
    .option("-o --output", "本地生成博客源md文件路径")
    .option("--csdn", "csdn博客地址")
    .option("--cookie", "任一已经登录csdn的cookie信息")
    .parse(Deno.args);

let config = {} as configType;
if (program.config) {
    //
    const decoder = new TextDecoder("utf-8");
    const data = await Deno.readFileSync(program.config);
    try {
        config = JSON.parse(decoder.decode(data));
    } catch (e) {
        console.log(e);
    }
} else if (program.csdn && program.output) {
} else {
    console.error("请指定配置文件路径");
}

if (!config.cookie && !config.cookies) {
    console.log("未提供cookie 使用爬取页面模式，页面数据可能有错误");
} else {
    console.log("提供cookie，使用文章api获取模式");
}

try {
    start(config);
} catch (e) {
    console.warn(e);
}
