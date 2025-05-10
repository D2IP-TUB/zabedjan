/**
 * Functions that you can include in your web page to generate a list of
 * publications from your DBLP profile.
 * 
 * Example usage:
 * <html><body onload="getPublicationsList('https://dblp.org/pid/43/10009.xml', '#pubs-list')">
 * <h2>Articles</h2><div id="pubs-list">Loading...</div>
 * </body></html>
 * 
 */
var loadedPubs = false;
async function getPublicationsList(url, dstNodeSelector) {
    if (loadedPubs) return;
    const xmlStr = await _loadXmlData(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "application/xml");
    const errNd = doc.querySelector("parsererror");
    if (errNd) {
        console.log("Failed to parse DBLP XML.");
    } else {
        console.log(doc.documentElement.nodeName);
        const recs = doc.getElementsByTagName("r");
        const pubs = []
        for (let i = 0; i < recs.length; i++) {
            const isJrnl = recs[i].getElementsByTagName("article").length == 1
            pubs.push(_extractItem(recs[i], isJrnl));
        }
        const myArticle = document.querySelector(dstNodeSelector);
        myArticle.innerHTML = `<ul>${pubs.join("")}</ul>`;
        loadedPubs = true;
    }
}

function _nodeVal(n, t) {
    const x = n.getElementsByTagName(t);
    return x.length > 0 ? x[0].innerHTML : "";
}

function _extractItem(nd, isJrnl) {
    const al = [];
    for (const a of nd.getElementsByTagName("author")) {
        al.push(a.innerHTML);
    }
    const au = al.join(", ");
    const at = _nodeVal(nd, "title");
    let bt = _nodeVal(nd, isJrnl ? "journal" : "booktitle");
    const yr = _nodeVal(nd, "year");
    const pg = _nodeVal(nd, "pages");
    const ee = _nodeVal(nd, "ee");
    if (isJrnl) {
        const vl = _nodeVal(nd, "volume");
        const no = _nodeVal(nd, "number");
        bt = `${bt} ${vl}:${no}`;
    }
    const pub = `<li>${au}: <i>${at}</i> ${bt}: ${pg} (${yr}). 
            <a href='${ee}' target="_blank">${ee}</a></li>`;
    return pub;
}

async function _loadXmlData(url) {
    console.log(`Fetching XML data from: ${url}`);
    const response = await fetch(url);
    const xmlStr = await response.text();
    console.log(xmlStr);
    return xmlStr;
}
