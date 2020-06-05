import { configType } from "./config.ts";
import { headers } from "./header.ts";
import { cheerio } from "./deps.ts";
import generateByPage from "./generateByPage.ts";
import generateByApi from "./generateByApi.ts";
export async function start({ csdn, output, cookie }: configType) {
    const article: { id: string; time: string }[] = [];
    for (let i = 0; true; i++) {
        const res = await fetch(`${csdn}/article/list/${i}`, {
            headers,
        });
        const html = await res.text();
        // @ts-ignore
        const $ = cheerio.load(html);
        const list = $(".article-item-box");
        if (list && list.length > 0) {
            $(".article-item-box").each(function (this: any) {
                // 获取当页文章连接id
                const idResult = $("a", this)
                    .attr("href")
                    .match(/(\d{1,})$/);

                if (idResult) {
                    article.push({
                        id: idResult[0],
                        time: $(".date", this).text().trim(),
                    });
                }
            });
        } else {
            break;
        }
    }
    console.log("正在生成文件....");
    const p = article.map(({ id, time }) => {
        if (cookie) {
            return generateByApi({
                id,
                time,
                output,
                cookie,
                csdn,
            });
        } else {
            return generateByPage({
                id,
                time,
                output,
                csdn,
            });
        }
    });

    await Promise.all(p);
    console.log("生成完成.....");
}
