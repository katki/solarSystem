
const formElement = document.getElementById('form');    
formElement.addEventListener('onclick', e => e.preventDefault());
    
let discussion=[];

if(localStorage.discussion){
    discussion=JSON.parse(localStorage.discussion);
}

function onRocket(){
    document.getElementById('rocket-path').classList.add("fly-out");
    document.getElementById('smoke-line1').classList.add("fly-out");
    document.getElementById('smoke-line2').classList.add("fly-out");
    document.getElementById('smoke-line3').classList.add("fly-out");
    document.getElementById('elipse').classList.add("fly-out");

    document.getElementById('dust-left').classList.add("hide-out");
    document.getElementById('dust-right').classList.add("hide-out");
}

function addComment(evt){
    if(document.getElementById("terms").checked == false){
        alert("You can not add comment, if you don't agree with terms.");
        return;
    } 
    
    const inputs = document.getElementById("form").elements;
    let oComment = {};
    oComment.name = inputs.name.value;
    oComment.url = inputs.url.value == "" ? "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png" : inputs.url.value;
    oComment.email = inputs.email.value;
    oComment.comment = inputs.comment.value;
    oComment.created = new Date();
    oComment.title = inputs.title.value;
    oComment.showName = inputs.yes.checked;
    
    discussion.push(oComment)
    onRocket();

    localStorage.discussion = JSON.stringify(discussion);
    formElement.reset();

    window.setTimeout(function(){
        window.location.href = "discussion.html";
    }, 5000);
}

