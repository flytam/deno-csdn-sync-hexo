import { fsExistsSync } from "./util.ts";
import { filenamify, sitdown, cheerio, path } from "./deps.ts";
import { generateParams } from "./config.ts";

import { headers } from "./header.ts";
const sitdownIns = new (sitdown as any).Sitdown({
    keepFilter: ["style"],
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    hr: "---",
});
const encoder = new TextEncoder();
const generateByPage = async (params: generateParams) => {
    // 严格模式下强行断言存在
    let file!: Deno.File;
    let { output, time, id, csdn } = params;

    output = path.resolve(output);
    if (!fsExistsSync(output)) {
        console.log("输出目录不存在，正在创建...");
        Deno.mkdirSync(output, { recursive: true });
    }

    try {
        const html = await fetch(`${csdn}/article/details/${id}`, {
            headers: headers,
        }).then((res) => res.text());

        let tags: string[] = []; //标签...爬虫获取不到标签
        let categories: string[] = []; //分类

        // @ts-ignore
        const $ = cheerio.load(html, {
            decodeEntities: true,
        });
        const title = $(".title-article").text();
        const x = $("#content_views").html();
        // csdn一个诡异的注释<!-- flowchart 箭头图标 勿删 -->
        const commentReg = /<!-- flowchart 箭头图标 勿删 -->/;
        if (!x) {
            return;
        }
        const markdown = sitdownIns.HTMLToMD(x).replace(commentReg, "");

        categories.push($(".tag-link").text().replace(/\s/g, ""));

        file = Deno.createSync(
            path.join(output, `./${(filenamify as any)(title)}.md`)
        );
        console.log("生成", title);
        Deno.writeSync(file.rid, encoder.encode("---\n"));

        Deno.writeSync(file.rid, encoder.encode(`title: ${title}\n`));
        Deno.writeSync(file.rid, encoder.encode(`date: ${time}\n`));
        Deno.writeSync(file.rid, encoder.encode(`tags: ${tags.join(" ")}\n`));
        Deno.writeSync(
            file.rid,
            encoder.encode(`categories: ${categories.join(" ")}\n`)
        );
        Deno.writeSync(file.rid, encoder.encode("---\n\n"));
        Deno.writeSync(file.rid, encoder.encode("<!--more-->\n\n"));

        Deno.writeSync(file.rid, encoder.encode(markdown));
    } catch (e) {
        console.log(`出错: ${id}`, e);
    } finally {
        if (file) {
            Deno.close(file.rid);
        }
    }
};

export default generateByPage;
