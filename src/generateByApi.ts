import { fs } from "./deps.ts";
import { path } from "./deps.ts";
import { fsExistsSync } from "./util.ts";
import { filenamify } from "./deps.ts";
import { generateParams } from "./config.ts";
import { headers } from "./header.ts";

const encoder = new TextEncoder();

const generateApi = async (params: generateParams) => {
    let { output, cookie, time, id } = params;

    // 严格模式下强行断言存在
    let file!: Deno.File;
    output = path.resolve(output);
    if (!fsExistsSync(output)) {
        console.log("输出目录不存在，正在创建...");
        Deno.mkdirSync(output, { recursive: true });
    }

    try {
        const res = await fetch(
            `https://blog-console-api.csdn.net/v1/editor/getArticle?id=${id}`,
            {
                headers: {
                    cookie: cookie as string,
                    ...headers,
                },
            }
        );

        const { data, code, msg } = await res.json();
        if (code !== 200) {
            console.log(code, msg);
            return;
        }

        const {
            markdowncontent,
            content,
            tags: tagsStr,
            categories: categoriesStr,
            title,
        } = data;
        let tags: string[] = []; //标签
        let categories: string[] = []; //分类

        if (tagsStr && tagsStr.length > 0) {
            tags = tagsStr.split(",");
        }

        if (categoriesStr && categoriesStr.length > 0) {
            categories = categoriesStr.split(",");
        }

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
        Deno.writeSync(
            file.rid,
            encoder.encode(markdowncontent || content || "")
        );
    } catch (e) {
        console.log(`出错: ${id}`, e);
    } finally {
        if (file) {
            Deno.close(file.rid);
        }
    }
};
export default generateApi;
