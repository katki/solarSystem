const articlesPerPage = 10;
const urlBase = "http://wt.kpi.fei.tuke.sk/api";
const back4appURL = "https://parseapi.back4app.com/classes/opinions";
const tag = "solarSystem";

const apiKey = "dyN63OIBos5My08QmXrc9Ci2qypbq6hQgoUeuXqp";
const appId = "gXH1AQMIHBTbR7lU8Y8UyAD7V8yqYOQlRqY6bHIK";

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
        getTemplate: renderOpinions
    }, {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: renderOpinionForm
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
        target: "newCommentForm",
        getTemplate: newCommentForArticle
    }, {
        hash: "commentsForArticle",
        target: "comments",
        getTemplate: loadCommentsForArticle
    }

];

function renderOpinionForm(targetElm) {
    let a = { author: "", email: "" };
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        a.author = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();
        a.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
    }
    document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-addOpinion").innerHTML, a);
}


async function fetchAndDisplayArticles(targetElm, current, total) {
    let articleList;
    let urlParams = "";

    //test4generateArticles();

    if (current && total) {
        current = parseInt(current);
        total = parseInt(total);
        urlParams += `?offset=${current}&max=${articlesPerPage}&tag=${tag}`;
    } else {
        urlParams += `?max=${articlesPerPage}&tag=${tag}`;
        current = 0;
    }

    //console.log(current + " " + total);

    try {
        const response = await fetch(`${urlBase}/article` + urlParams);
        if (!response.ok) throw new Error(`Server answered with ${response.status}: ${response.statusText}.`);

        const responseJSON = await response.json();
        articleList = createArticles(responseJSON);

        total = responseJSON.meta.totalCount;

        const p = articleList.map(article => fetch(`${urlBase}/article/${article.id}`));
        const contentRequests = await Promise.all(p);

        for (let response of contentRequests) {
            if (!response.ok) throw new Error(`Failed to access the content of the article. ${response.statusText}.`);
        }

        const articlesP = contentRequests.map(res => res.json());
        const articles = await Promise.all(articlesP);

        articles.forEach((article, index) => {
            articleList[index].content = article.content;
            if (articleList[index].tags.indexOf(tag) != -1) articleList[index].tags.pop();
        });

        document.getElementById("routeArticles").href = "#articles/" + current + "/" + total;

        renderArticles(targetElm);

    } catch (error) {
        alert(error);
    }

    function renderArticles(targetElm) {
        const articleElement = document.getElementById(targetElm);
        const articlesTemplate = document.getElementById("articlesTemplate");
        const prev = current > 0 ? "<a class='button' href='#articles/" + (current - 10) + "/" + total + "'>Prev</a>" : "";
        const next = current + 10 < total ? "<a class='button' href='#articles/" + (current + 10) + "/" + total + "'>Next</a>" : "";

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

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) articleInfo.author = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();

    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            articleInfo
        );
}


async function deleteArticle(targetElm, artIdFromHash) {
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
        if (article.tags.indexOf(tag) != -1) article.tags.pop();
        console.log(article.tags)

        if (forEdit) {
            article.formTitle = "Article Edit";
            article.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
            article.urlBase = urlBase;
            article.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) article.author = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();


            document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-article-form").innerHTML, article);
        } else {
            article.editLink = `#artEdit/${article.id}/${offsetFromHash}/${totalCountFromHash}`;
            article.deleteLink = `#artDelete/${article.id}/${offsetFromHash}/${totalCountFromHash}`;
            article.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
            article.addLink = `#newCommentForArticle/${artIdFromHash}`;
            document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-article").innerHTML, article);
        }

        loadCommentsForArticle(targetElm, artIdFromHash, 0);

    } catch (error) {
        const errMsgObj = { errMessage: error };
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
    }
}

async function loadCommentsForArticle(targetElm, artIdFromHash, offset) {
    const url = `${urlBase}/article/${artIdFromHash}/comment?max=10&offset=${offset}`;
    console.log(url)
    try {
        const commentsRes = await fetch(url);
        if (!commentsRes.ok) throw new Error(`Server answered with ${commentsRes.status}: ${commentsRes.statusText}.`);

        const comments = await commentsRes.json();

        renderComments("comments", artIdFromHash, comments.comments, comments.meta.offset, comments.meta.totalCount);

    } catch (error) {
        console.log("loadCommentsForArticle: " + error);
    }
}

function newCommentForArticle(targetElem, id) {
    let info = {
        formSubmitCall: `addComment( event, '${urlBase}',${id})`,
        urlBase: urlBase,
        backLink: `#articles`,
        formTitle: "Add new comment",
    };

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) info.author = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();


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

function renderComments(targetElm, artIdFromHash, sourceData, current, total) {
    const commentElement = document.getElementById(targetElm);
    if (commentElement == null) return;
    current = parseInt(current);
    const emptyComments = "<p class='info'> No comments yet.</p>"
    const n = current + 10;

    const prev = current > 0 ? "<a class='button' href='#commentsForArticle/" + artIdFromHash + "/" + (current - 10) + "'>Prev</a>" : "";
    const next = n < total ? "<a class='button' href='#commentsForArticle/" + artIdFromHash + "/" + n + "'>Next</a>" : "";

    if (sourceData.length > 0) {
        commentElement.innerHTML = sourceData.reduce((a, i) => a + generate(i, true), "") + prev + next;
    } else {
        commentElement.innerHTML = emptyComments;
    }
}

async function renderOpinions(targetElm) {
    const emptyComments = "<p class='info'> No comments yet.</p>"
    const commentElement = document.getElementById(targetElm);
    try {
        const options = {
            method: 'GET',
            headers: {
                'X-Parse-Application-Id': appId,
                'X-Parse-REST-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(back4appURL, options);
        if (!response.ok) throw new Error(`Server answered with ${response.status}: ${response.statusText}.`);

        let discussion = await response.json();
        if (discussion.results.length > 0) commentElement.innerHTML = discussion.results.reduce((a, i) => a + generate(i, false), "");
        else commentElement.innerHTML = emptyComments;

    } catch (err) {
        alert(err);
    }
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
        comment.keywords = comment.keywords ? comment.keywords : "No keywords for this opinion";
        let html = Mustache.render(template, comment);
        delete (comment.createdDate);
        delete (comment.author);
        delete (comment.showEmail);
        return html;
    }
}

function test4generateArticles() {
    for (let i = 0; i < 20; i++) {
        const articleData = {
            title: "title " + i,
            content: "content  " + i,
            author: "author " + i,
            imageLink: "",
            tags: []
        };

        articleData.tags.push("solarSystem");
        articleData.tags.push("test");


        const postReqSettings = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(articleData),
        };

        fetch(`${urlBase}/article`, postReqSettings)
            .then(response => {
                console.log(response);

                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })
            .then(responseJSON => {
                console.log(responseJSON)
                ids.push(JSON.id);
            })
            .catch(error => {
                console.log(error);
                window.alert(`Failed to save the updated article on server. ${error}`);
            });
    }

    function removeTestArticles() {
        if (ids.length == 0) return;

        ids.forEach(id => {
            deleteArticle("targetElm", id);
        });
        ids.length = 0;
    }


}