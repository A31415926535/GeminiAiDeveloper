//Section 1: Welcome Page
console.clear();

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
    gsap.timeline({
        scrollTrigger: {
            trigger: ".wrapper",
            start: "top top",
            end: "bottom top",
            pin: true,
            scrub: true,
            markers: false,
            //Control Section 2 to appear or hidden
            onEnter: () => {
                document.querySelector('.chatbox-container').style.display = 'none';
            },
            onLeave: () => {
                document.querySelector('.chatbox-container').style.display = 'block';
            },
            onEnterBack: () => {
                document.querySelector('.chatbox-container').style.display = 'none';
            }

        }
    })
    //Animation of image while scrolling
    .to(".image-container img", {
        scale: 2,
        z: 350,
        transformOrigin: "center center",
        ease: "power1.inOut"
    })
    .to(".section.homepage", {
        scale: 1.1,
        transformOrigin: "center center",
        ease: "power1.inOut"
    }, "<");
});

//Custom cursor
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.scroll-down');
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    });
