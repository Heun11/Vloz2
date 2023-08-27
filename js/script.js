
var first_time_open_popup = true;

function openAboutPopup(){
    document.getElementById("about-popup").style.width = window.innerWidth*0.4+"px";
    document.getElementById("about-popup").style.opacity = 1;

    document.getElementById("popup-background").style.zIndex = 1;
    document.getElementById("popup-background").style.width = window.innerWidth+"px";
    document.getElementById("popup-background").style.opacity = 0.7;
}

function closeAboutPopup(){
    document.getElementById("about-popup").style.width = "0px";
    document.getElementById("about-popup").style.opacity = 0;

    document.getElementById("popup-background").style.zIndex = -1;
    document.getElementById("popup-background").style.width ="0px";
    document.getElementById("popup-background").style.opacity = 0;

    first_time_open_popup = true;
}

function getMousePos(event) {
    var x = event.clientX;
    var y = event.clientY;
    var popup_rect = document.getElementById("about-popup").getBoundingClientRect();
    
    if(popup_rect.width>0){
        if(first_time_open_popup){
            first_time_open_popup = false;
        }
        else{
            if(!(x<popup_rect.x+popup_rect.width && x>popup_rect.x && y>popup_rect.y && y<popup_rect.y+popup_rect.height)){
                closeAboutPopup();
            }
        }
    }
}

document.addEventListener("click", getMousePos);