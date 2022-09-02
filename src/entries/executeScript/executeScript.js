export default function scrollToTarget(eleId, type, headerHeight = 40) {
    // reference: https://stackoverflow.com/a/67647864/6908282
    // this function is being used in popupjs for sctoll to the answer/comment clicked dby the user
    if (type == "question") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        let element = document.getElementById(eleId);
        element.classList.add("highlighted-post"); // CSS class 'highlighted-post' has a animation called

        if (type == "comment") {
            element = document.getElementById(eleId).getElementsByClassName("comment-text")[0];
            element.style.backgroundColor = "var(--yellow-100)"; // comments have a transition for backgroundColor. So settimeout to remove backgroundcolor triggers that's transition
        }
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition - headerHeight;
        window.scrollBy({
            top: offsetPosition,
            behavior: "smooth",
        });

        setTimeout(function () {
            element.classList.remove("highlighted-post");
            element.style.backgroundColor = "";
        }, 3000);
    }
}