function move(parent){
    var movingShift = new Point(0,0);
    var selectedElement = null;
    var scrollableElement = document.getElementById('container');
    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    function scaleOffset(obj,offset){
        var newScale = obj.scaling.x + offset;
        if(offset< 0 && (obj.bounds.width * (1+offset) < 50 ||obj.bounds.height * (1+offset) < 50 )) return;
        console.log(obj.bounds.width + " "  + obj.scaling.x)
        obj.scaling.x = newScale;
        obj.scaling.y = newScale;
    }
    function start() {
        parent.onMouseDown = function(event) {
            if(parent.moveable === false) return;
            var hit = project.hitTest(event.point,hitOptions);
            disSelected();
            if (hit) {
                if (event.modifiers.shift) {
                    if (hit.type === 'segment') {
                        hit.segment.remove();
                    }
                    return;
                }
                if (event.modifiers.control) {
                    if (hit.type === 'stroke') {
                        var location = hit.location;
                        var segment = hit.item.insert(location.index + 1, event.point);
                    }
                    return;
                }
                selectedElement = hit.segment ||  hit.item;
                console.log(`click ${event.point} with selected ${JSON.stringify(selectedElement)}`)
                selectedElement.selected = true;
                //hit.item.crossings[0].segment.selected = true;
                var selectedPosition = selectedElement.position || selectedElement.point;
                movingShift.x = selectedPosition.x - event.point.x;
                movingShift.y = selectedPosition.y - event.point.y;
            }
        }
        parent.onMouseDrag= function (event) {
            if(parent.moveable === false) return;
            if(selectedElement && selectedElement.selected){
                var selectedPosition = selectedElement.position || selectedElement.point;
                selectedPosition.x = event.point.x + movingShift.x;
                selectedPosition.y = event.point.y + movingShift.y;
            }
        }
        scrollableElement.addEventListener('wheel', scroll);
    }
    function disSelected() {
        if(selectedElement)
        {
            selectedElement.selected  = false;
            selectedElement = null;
        }
    }
    function stop() {
        disSelected();
        parent.onMouseDrag = parent.onMouseDown = null;
        scrollableElement.removeEventListener('wheel', scroll)
    }
    function scroll(event){
        var delta;
        if (event.wheelDelta){
            delta = event.wheelDelta;
        }else{
            delta = -1 * event.deltaY;
        }
        if (delta < 0){
            //console.log("DOWN");
            if(selectedElement && selectedElement.selected)
            {
                scaleOffset(selectedElement,-0.1);
                return;
            }
            //zoomIn()
        }else if (delta > 0){
            //console.log("UP");
            if(selectedElement && selectedElement.selected)
            {
                scaleOffset(selectedElement,0.1);
                return;
            }
            //zoomOut();
        }
    }
    return {
        start,
        stop
    }
}

module.exports = move