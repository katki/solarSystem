let discussion = [];
if (localStorage.discussion) discussion = JSON.parse(localStorage.discussion);

console.log(discussion);

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
    },

];

function fetchAndDisplayArticles(targetElm, current, total) {
    const url = "https://wt.kpi.fei.tuke.sk/api/article";
    let articleList;

    current = parseInt(current);
    total = parseInt(total);

    current = Math.abs(parseInt(localStorage.current) - current) == 1 ? current : parseInt(localStorage.current);
    total = Math.abs(parseInt(localStorage.total) - total) == 1 ? total : parseInt(localStorage.total);

    fetch(`${url}?max=${total}&offset=${current}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            responseJSON.articles.forEach(e => {
                e.dateCreated = new Date(e.dateCreated).toDateString();
                e.lastUpdated = new Date(e.lastUpdated).toDateString();
                e.showDetail = "showArticleDetail(" + e.id + ")";
            });
            articleList = responseJSON.articles;
            return Promise.resolve();
        }).then(() => {
            let cntRequests = articleList.map(article => fetch(`${url}/${article.id}`));
            return Promise.all(cntRequests);
        }).then(responses => {
            let failed = "";
            for (let response of responses) {
                if (!response.ok) failed += response.url + " ";
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article, index) => {
                articleList[index].content = article.content;
            });
            return Promise.resolve();
        })
        .then(() => {
            renderArticles("router-view");
            console.log(articleList)
        })
        .catch(error => console.log(error));

    function renderArticles(targetElm) {
        const articleElement = document.getElementById(targetElm);
        const articleTemplate = document.getElementById("articleTemplate");
        const prev = current - 1 ? "<a class='button' href='#articles/" + (current - 1) + "/" + total + "'>Prev</a>" : "";
        const next = "<a class='button' href='#articles/" + (current + 1) + "/" + total + "'>Next</a>";

        articleElement.innerHTML = "";
        if (articleList.length > 0) {
            articleElement.innerHTML = articleList.reduce((a, i) => a + Mustache.render(articleTemplate.innerHTML, i), "") + prev + next;
        } else
            articleElement.innerHTML = "<p class='info'> No articles yet.</p>";
    }

    localStorage.total = total;
    localStorage.current = current;
}


function renderComments(targetElm) {
    const emptyComments = "<p class='info'> No comments yet.</p>"
    const commentElement = document.getElementById(targetElm);
    commentElement.innerHTML = "";
    if (discussion.length > 0) commentElement.innerHTML = discussion.reduce((a, i) => a + generate(i), "");
    else commentElement.innerHTML = emptyComments;
}

function generate(comment) {
    comment.createdDate = new Date(comment.created).toDateString();
    comment.author = comment.showName ? comment.name : "anonymous";
    comment.showEmail = "mailto:" + comment.email;

    const template = document.getElementById("commentTemplate").innerHTML;
    const html = Mustache.render(template, comment);

    delete (comment.createdDate);
    delete (comment.author);
    delete (comment.showEmail);

    return html;
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
    renderComments();
    localStorage.discussion = JSON.stringify(discussion);
}


/*
fetch(`${url}?max=${total}&offset=${current}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            responseJSON.articles.forEach(e => {
                e.dateCreated = new Date(e.dateCreated).toDateString();
                e.lastUpdated = new Date(e.lastUpdated).toDateString();
                e.showDetail = "showArticleDetail(" + e.id + ")";
            });
            articleList = responseJSON.articles;
            return Promise.resolve();
        }).then(() => {
            let cntRequests = articleList.map(article => fetch(`${url}/${article.id}`));
            return Promise.all(cntRequests);
        }).then(responses => {
            let failed = "";
            for (let response of responses) {
                if (!response.ok) failed += response.url + " ";
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        /*.then(articles => {
            articles.forEach((article, index) => {
                articleList[index].content = article.content;
            });
            return Promise.resolve();
        })
         .then(() => {
            let commRequests = articleList.map(
                article => fetch(`${url}/${article.id}/comment`)
            );
            return Promise.all(commRequests)
        })
        .then(responses => {
            let failed = "";
            for (let response of responses) {
                if (!response.ok) failed += response.url + " ";
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the comments with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(comments => {
            comments.forEach((artComments, index) => {
                articleList[index].comments = artComments.comments;
            });
            return Promise.resolve();
        }) .then(() => {
            renderArticles("router-view");
        })
        .catch(error => console.log(error)); */