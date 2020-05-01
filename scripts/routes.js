let discussion = [];
if (localStorage.discussion) discussion = JSON.parse(localStorage.discussion);

const articlesPerPage = 20;
const urlBase = "http://wt.kpi.fei.tuke.sk/api";

export default [

    {
        hash: "welcome",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    }, {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    }, {
        hash: "commentSection",
        target: "router-view",
        getTemplate: renderComments
    }, {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML
    }, {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    }, {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    }, {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    }, {
        hash: "artInsert",
        target: "router-view",
        getTemplate: newArticleForm
    }, {
        hash: "newCommentForArticle",
        target: "comments",
        getTemplate: newCommentForArticle
    }

];

async function fetchAndDisplayArticles(targetElm, current, total) {
    let articleList;
    let urlParams = "";

    if (current && total) {
        urlParams += `?offset=${current}&max=${articlesPerPage}`;
    } else {
        urlParams += `?max=${articlesPerPage}`;
    }

    try {
        const response = await fetch(`${urlBase}/article` + urlParams);
        if (!response.ok) throw new Error(`Server answered with ${response.status}: ${response.statusText}.`);

        const responseJSON = await response.json();
        articleList = createArticles(responseJSON);

        const p = articleList.map(article => fetch(`${urlBase}/article/${article.id}`));
        const contentRequests = await Promise.all(p);

        for (let response of contentRequests) {
            if (!response.ok) throw new Error(`Failed to access the content of the article. ${response.statusText}.`);
        }

        const articlesP = contentRequests.map(res => res.json());
        const articles = await Promise.all(articlesP);

        articles.forEach((article, index) => {
            articleList[index].content = article.content;
        });

        renderArticles(targetElm);

    } catch (error) {
        alert(error);
    }

    function renderArticles(targetElm) {
        const articleElement = document.getElementById(targetElm);
        const articlesTemplate = document.getElementById("articlesTemplate");
        const prev = current - 1 ? "<a class='button' href='#articles/" + (current - 1) + "/" + total + "'>Prev</a>" : "";
        const next = "<a class='button' href='#articles/" + (current + 1) + "/" + total + "'>Next</a>";

        articleElement.innerHTML = "";
        if (articleList.length > 0) {
            articleElement.innerHTML = articleList.reduce((a, i) => a + Mustache.render(articlesTemplate.innerHTML, i), "") + prev + next;
        } else
            articleElement.innerHTML = "<p class='info'> No articles yet.</p>";
    }
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, false);
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, true);
}

function newArticleForm(targetElm) {
    let articleInfo = {};

    articleInfo.formSubmitCall = `addArticle( event, '${urlBase}')`;
    articleInfo.urlBase = urlBase;
    articleInfo.backLink = `#articles`;

    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            articleInfo
        );
}


async function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {

    const id = parseInt(artIdFromHash);
    const deleteReqSettings = { method: 'DELETE' };

    try {
        const res = await fetch(`${urlBase}/article/${id}`, deleteReqSettings);
        if (!res.ok) throw new Error(`Server answered with ${response.status}: ${response.statusText}.`)
    } catch (error) {
        alert(`Attempt failed. Details: <br />  ${error}`);
    } finally {
        window.location.hash = `#articles`
    }

}


/**
 * Gets an article record from a server and processes it to html according to the value of the forEdit parameter.
 * Assumes existence of the urlBase global variable with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates with id="template-article" (if forEdit=false)
 * and id="template-article-form" (if forEdit=true).
 * @param targetElm - element to which the acquired article record will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
async function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server answered with ${response.status}: ${response.statusText}.`);
        }

        const article = await response.json();

        if (forEdit) {
            article.formTitle = "Article Edit";
            article.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
            article.urlBase = urlBase;
            article.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

            document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-article-form").innerHTML, article);
        } else {
            article.editLink = `#artEdit/${article.id}/${offsetFromHash}/${totalCountFromHash}`;
            article.deleteLink = `#artDelete/${article.id}/${offsetFromHash}/${totalCountFromHash}`;
            article.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
            article.addLink = `#newCommentForArticle/${artIdFromHash}`;
            document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-article").innerHTML, article);
        }

        const commentsRes = await fetch(`${url}/comment`);

        if (!commentsRes) throw new Error(`Server answered with ${commentsRes.status}: ${commentsRes.statusText}.`);

        const comments = await commentsRes.json();

        console.log(comments)

        renderComments("comments", comments.comments, true);

    } catch (error) {
        const errMsgObj = { errMessage: error };
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
    }
}

function newCommentForArticle(targetElem, id) {
    let info = {
        formSubmitCall: `addComment( event, '${urlBase}',${id})`,
        urlBase: urlBase,
        backLink: `#articles`,
        formTitle: "Add new comment"
    };

    document.getElementById(targetElem).innerHTML =
        Mustache.render(
            document.getElementById("template-comment-form").innerHTML,
            info
        );
}

function createArticles(responseJSON) {
    responseJSON.articles.forEach(e => {
        e.dateCreated = new Date(e.dateCreated).toDateString();
        e.lastUpdated = new Date(e.lastUpdated).toDateString();
        e.showDetail = "showArticleDetail(" + e.id + ")";
        e.detailLink = `#article/${e.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
    });

    return responseJSON.articles;
}

function renderComments(targetElm, sourceData, fromServer) {
    if (!fromServer) sourceData = discussion;

    const emptyComments = "<p class='info'> No comments yet.</p>"
    const commentElement = document.getElementById(targetElm);

    commentElement.innerHTML = "";

    if (sourceData.length > 0) commentElement.innerHTML = sourceData.reduce((a, i) => a + generate(i, fromServer), "");
    else commentElement.innerHTML = emptyComments;
}

function generate(comment, fromServer) {
    const template = document.getElementById("commentTemplate").innerHTML;

    if (fromServer) {
        comment.createdDate = new Date(comment.dateCreated).toDateString();
        comment.author = comment.author ? comment.author : "anonymous";
        comment.comment = comment.text;
        comment.keywords = comment.id;
        return Mustache.render(template, comment);
    } else {
        comment.createdDate = new Date(comment.created).toDateString();
        comment.author = comment.showName ? comment.name : "anonymous";
        comment.showEmail = "mailto:" + comment.email;
        let html = Mustache.render(template, comment);
        delete (comment.createdDate);
        delete (comment.author);
        delete (comment.showEmail);
        return html;
    }
}

function removeOldComments() {
    console.log(discussion)
    let removed = 0;
    for (let i = 0; i < discussion.length; i++) {
        if (Date.now() - new Date(discussion[i].created) > 30283179) {
            discussion.splice(i);
        }
    }
    discussion.length -= removed;
    renderComments("router-view", discussion);
    localStorage.discussion = JSON.stringify(discussion);
}
