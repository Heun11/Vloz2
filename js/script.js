(function(){
    emailjs.init("9uvV0oEj9_iG8Aum8");
})();

function sendEmail(){
    var params = {
        name:document.getElementById("name").value,
        email:document.getElementById("email").value,
        text:document.getElementById("text").value
    };
    const serviceId = "service_acyc4tm";
    const templateId = "template_47ya5ap";

    if(params.name!="" && params.email!="" && params.text!=""){
        emailjs.send(serviceId, templateId, params).then((res) => {
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("text").value = "";
            console.log(res);
            alert("Vaša správa sa poslala!");
        }).catch(err=>console.log(err));
    }
    else{
        alert("Doplň zvyšné políčka!");
    }
}