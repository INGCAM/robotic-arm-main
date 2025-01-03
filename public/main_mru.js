let socket = io.connect('https://didactec.com.co', {'forceNew': true });
//let socket = io.connect('http://192.168.1.8:3003', {'forceNew': true });
let less_button = document.getElementById('less');

let chart;

socket.on('messages', function(data){
    console.log(data);
    render(data);
});


socket.on('machine-status', function(data) {
    if(data['arm-status'] === 'arm-ok'){
        console.log("Brazo listo");
        document.getElementById('set-arm').style.display = "block";
        document.getElementById('drop_ball').style.display = "block";
        document.getElementById('label_ok').style.display = "block";
    }
    if(data['arm-status'] === 'arm-onmove'){
        console.log("Brazo en movimiento");
        document.getElementById('set-arm').style.display = "none";
        document.getElementById('drop_ball').style.display = "none";
        document.getElementById('label_ok').style.display = "none";
    }
})

socket.on('to-graph', function(data_server) {
    console.log(data_server);
    var data_list = []
    var time_array = data_server['time'];
    var distance_array = data_server['distance'];
    for (var u = 0 ; u < time_array.length ; u++) {
        data_list.push({x: time_array[u],y: distance_array[u]});
    }
    console.log(data_list);

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title:{
            text: "Distancia contra tiempo"
        },
        toolTip: {
            shared: true
        },
        axisX: {
            title: "Tiempo",
            suffix : " s"
        },
        axisY: {
            title: "Distancia",
            titleFontColor: "#4F81BC",
            suffix : " m/s",
            lineColor: "#4F81BC",
            tickColor: "#4F81BC"
        },
        axisY2: {
            title: "Distancia",
            titleFontColor: "#C0504E",
            suffix : " m",
            lineColor: "#C0504E",
            tickColor: "#C0504E"
        },
        data: [{
            type: "spline",
            name: "speed",
            xValueFormatString: "#### sec",
            yValueFormatString: "#,##0.00 m/s",
            dataPoints: data_list
            
        }]
    });
    chart.render();

});

function render(data) {
    var html = data.map(function(elem, index){
        return `<h5>
        <strong>${elem.author}:</strong>
        <em>${elem.text}</em>
        </h5>`;
    }).join(" ");
    
    document.getElementById('messages').innerHTML = html;
    //document.getElementById('drop_ball').setAttribute('style','display',"none");
    //document.getElementById('label_ok').setAttribute('style','display',"none");
}

function setAngle(e) {
    var payload = {
        angle: document.getElementById('angle').value
    };
    socket.emit('web-to-machine-new-angle', payload);
}

function lessAngle(e) {
    if( parseInt( document.getElementById('angle').value) >= 1){
        document.getElementById('angle').value = parseInt(document.getElementById('angle').value) - 1;
        setAngle(e);
    }
}

function plusAngle(e) {
    if( parseInt( document.getElementById('angle').value) <= 89){
        document.getElementById('angle').value = parseInt(document.getElementById('angle').value) + 1;
        setAngle(e);
    }
}

function setArm(e) {
    setAngle(e);
    var payload = {
        action: "set_arm"
    };
    socket.emit('web-to-machine-drop-ball', payload);
}

function dropBall(e) {
    setAngle(e);
    var payload = {
        action: "drop_ball"
    };
    socket.emit('web-to-machine-drop-ball', payload);
    return false;
}