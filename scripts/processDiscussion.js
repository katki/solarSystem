const back4appURL = "https://parseapi.back4app.com/classes/opinions";
const apiKey = "dyN63OIBos5My08QmXrc9Ci2qypbq6hQgoUeuXqp";
const appId = "gXH1AQMIHBTbR7lU8Y8UyAD7V8yqYOQlRqY6bHIK";

const formElement = document.getElementById('form');
formElement.addEventListener('onclick', e => e.preventDefault());

console.log("here");


function onRocket() {
    document.getElementById('rocket-path').classList.add("fly-out");
    document.getElementById('smoke-line1').classList.add("fly-out");
    document.getElementById('smoke-line2').classList.add("fly-out");
    document.getElementById('smoke-line3').classList.add("fly-out");
    document.getElementById('elipse').classList.add("fly-out");

    document.getElementById('dust-left').classList.add("hide-out");
    document.getElementById('dust-right').classList.add("hide-out");
}

async function addComment(evt) {
    evt.preventDefault();
    console.log("1");

    if (document.getElementById("terms").checked == false) {
        alert("You can not add comment, if you don't agree with terms.");
        return;
    }

    console.log("2");

    const inputs = document.getElementById("form").elements;
    let oComment = {};
    oComment.name = inputs.name.value;
    oComment.url = inputs.url.value == "" ? "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png" : inputs.url.value;
    oComment.email = inputs.yes.checked == "" ? "#" : inputs.email.value;
    oComment.comment = inputs.comment.value;
    oComment.created = new Date();
    oComment.title = inputs.title.value;
    oComment.showName = inputs.yes.checked;
    oComment.keywords = inputs.keywords.value;

    console.log("3");

    console.log(oComment);


    onRocket();
    try {
        const options = {
            method: 'POST',
            headers: {
                'X-Parse-Application-Id': appId,
                'X-Parse-REST-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(oComment),
        };
        const response = await fetch(back4appURL, options);
        if (!response.ok) throw new Error(`Server answered with ${response.status}: ${response.statusText}.`);
    } catch (error) {
        console.log(error)
        // alert(error);
    }
    //formElement.reset();

    window.setTimeout(function () {
        window.location.href = "index.html#commentSection";
    }, 3000);
}