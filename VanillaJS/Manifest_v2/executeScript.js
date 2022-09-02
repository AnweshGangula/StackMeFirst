
scrollToTarget(eleID, type, headerHeight);

function scrollToTarget(eleID, type, headerHeight = 40) {
    // reference: https://stackoverflow.com/a/67647864/6908282
    // this function is being used in popupjs for sctoll to the answer/comment clicked dby the user
    let element = document.getElementById(eleID);
    element.classList.add("highlighted-post");

    if (type == "comment") {
        element = document.getElementById(eleID).getElementsByClassName("comment-text")[0];
        element.style.backgroundColor = 'var(--yellow-100)' // comments have a transition for backgroundColor. So settimeout below is technically not necessary
    }
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition - headerHeight;

    window.scrollBy({
        top: offsetPosition,
        behavior: "smooth"
    });

    setTimeout(function () {
        element.classList.remove("highlighted-post");
        element.style.backgroundColor = ''
    }, 3000);
}