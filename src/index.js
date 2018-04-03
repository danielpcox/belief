import { jsPlumb } from 'jsplumb'

const propositions = [
    {
        "_id": "5ac403178505b096fed5dca7",
        "index": 0,
        "description": "She weighs as much as a duck",
        "priorN": 1,
        "priorD": 5000,
        "probabilityN": 1,
        "ProbabilityD": 5000
    },
    {
        "_id": "5ac403172dcb8ad404b3e718",
        "index": 1,
        "description": "She is a witch",
        "priorN": 1,
        "priorD": 2,
        "probabilityN": 1,
        "ProbabilityD": 5000
    },
    {
        "_id": "5ac4031718a683419ef04f34",
        "index": 2,
        "description": "We can burn witches",
        "priorN": 1,
        "priorD": 1,
        "probabilityN": 1,
        "ProbabilityD": 5000
    },
    {
        "_id": "5ac40317b41ec65a2c8bba0a",
        "index": 3,
        "description": "Text Description",
        "priorN": 0,
        "priorD": 1,
        "probabilityN": 1,
        "ProbabilityD": 5000
    }
];

jsPlumb.bind("jsPlumbDemoLoaded", function (instance) {

    var renderer = jsPlumbToolkit.Support.ingest({
        jsPlumb: instance
    });

    // bind to the node added event and tell the renderer to ingest each one

    instance.bind("jsPlumbDemoNodeAdded", function (el) { renderer.ingest(el); });
});

;
(function () {

    var listDiv = document.getElementById("list"),

        showConnectionInfo = function (s) {
            listDiv.innerHTML = s;
            listDiv.style.display = "block";
        },
        hideConnectionInfo = function () {
            listDiv.style.display = "none";
        },
        connections = [],
        updateConnections = function (conn, remove) {
            if (!remove) connections.push(conn);
            else {
                var idx = -1;
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i] == conn) {
                        idx = i;
                        break;
                    }
                }
                if (idx != -1) connections.splice(idx, 1);
            }
            if (connections.length > 0) {
                var s = "<span><strong>Connections</strong></span><br/><br/><table><tr><th>Scope</th><th>Source</th><th>Target</th></tr>";
                for (var j = 0; j < connections.length; j++) {
                    s = s + "<tr><td>" + connections[j].scope + "</td>" + "<td>" + connections[j].sourceId + "</td><td>" + connections[j].targetId + "</td></tr>";
                }
                showConnectionInfo(s);
            } else
                hideConnectionInfo();
        };

    jsPlumb.ready(function () {

        const colorRed = "rgb(255,59,48)";
        const colorBlue = "rgb(0,122,255)";
        const colorGreen = "rgb(76,217,100)";
        const defaultConnectionCurviness = 50;
        const InputColor = colorRed;
        const OutputEndpointColor = colorGreen;

        var instance = jsPlumb.getInstance({
            DragOptions: { cursor: 'pointer', zIndex: 2000 },
            PaintStyle: { stroke: colorGreen },
            EndpointHoverStyle: { fill: colorBlue },
            HoverPaintStyle: { stroke: colorBlue },
            EndpointStyle: { width: 16, height: 16, stroke: colorGreen },
            Endpoint: "Dot",
            Anchors: ["TopCenter", "TopCenter"],
            Container: "canvas"
        });

        // suspend drawing and initialise.
        instance.batch(function () {

            // bind to connection/connectionDetached events, and update the list of connections on screen.
            instance.bind("connection", function (info, originalEvent) {
                updateConnections(info.connection);
            });
            instance.bind("connectionDetached", function (info, originalEvent) {
                updateConnections(info.connection, true);
            });

            instance.bind("connectionMoved", function (info, originalEvent) {
                //  only remove here, because a 'connection' event is also fired.
                // in a future release of jsplumb this extra connection event will not
                // be fired.
                updateConnections(info.connection, true);
            });

            instance.bind("click", function (component, originalEvent) {
                alert("click!")
            });

            // configure some drop options for use by all endpoints.
            var exampleDropOptions = {
                tolerance: "touch",
                hoverClass: "dropHover",
                activeClass: "dragActive"
            };

            var InputEndpoint = {
                endpoint: ["Dot", { radius: 8 }],
                paintStyle: { fill: colorGreen },
                isSource: true,
                isTarget: true,
                scope: "probabilityConnection",
                connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
                connector: ["Bezier", { curviness: defaultConnectionCurviness }],
                maxConnections: -1,
                dropOptions: exampleDropOptions
            };

            var OutputEndpoint = {
                endpoint: ["Dot", { radius: 8 }],
                paintStyle: { fill: colorGreen },
                isSource: true,
                isTarget: true,
                scope: "probabilityConnection",
                connectorStyle: { stroke: colorGreen, strokeWidth: 2 },
                connector: ["Bezier", { curviness: defaultConnectionCurviness }],
                maxConnections: -1,
                dropOptions: exampleDropOptions
            };

            // make .window divs draggable
            instance.draggable(jsPlumb.getSelector(".drag-drop-demo .window"));

            // add input and output endpoints.
            instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "LeftMiddle" }, InputEndpoint);
            instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), { anchor: "RightMiddle" }, OutputEndpoint);
        });

        jsPlumb.fire("jsPlumbDemoLoaded", instance);

    });
})();

