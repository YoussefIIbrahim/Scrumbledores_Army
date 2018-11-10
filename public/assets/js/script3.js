window.onload = addListeners();

function addListeners(){
        (document).getElementById('navigationBar').addEventListener('mousedown', mouseDown, false);
        window.addEventListener('mouseup', mouseUp, false);

};

function mouseUp()
{
        window.removeEventListener('mousemove', divMove, true);
        var div = (document).getElementById('navigationBar');
        div.style.position = 'fixed';
};

function mouseDown(e){
    window.addEventListener('mousemove', divMove, true);
};

function divMove(e){
    var div = (document).getElementById('navigationBar');
    div.style.position = 'absolute';
    div.style.top = e.clientY + 'px';
    div.style.right = e.clientX + 'px';
}​;
