
function setLightRenderingAndPlane() {
// Grid & plane

    var size = 500;
    var geometry = new THREE.Geometry();

    for (var i = -size; i <= size; i += step) {

        geometry.vertices.push(new THREE.Vector3(-size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));

        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size));

    }

    line = new THREE.Line(geometry, lineMaterial);
    line.type = THREE.LinePieces;
    line.name = "Line";

    projector = new THREE.Projector();

    planeGeometryX = 1000;
    planeGeometryY = 1000;

    plane = new THREE.Mesh(new THREE.PlaneGeometry(planeGeometryX, planeGeometryY), new THREE.MeshBasicMaterial());
    plane.name = "Grid";
    plane.rotation.x = -Math.PI / 2;
    plane.visible = false;
    mainContainer.add(plane);

    mouse2D = new THREE.Vector3(0, 10000, 0.5);

    // Lights

    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0xa3a3a3);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        clearColor: 0xaaaaaa,
        clearAlpha: 1
    });

    //renderer = new THREE.CanvasRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    window.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('keyup', onDocumentKeyUp, false);

    heightController.addEventListener('change', onHeightChange, false);

    window.addEventListener('resize', onWindowResize, false);
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function save(scene, renderer) {
    //window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
    var clearColor = renderer.getClearColor();
    var clearAlpha = renderer.getClearAlpha();

    var output = new THREE.SceneExporter().parse(scene, clearColor, clearAlpha);

    var blob = new Blob([output], {
        type: 'text/plain'
    });

    blob = blob.slice(0, blob.size, 'text/octet-stream');
    saveAs(
            blob
            , "document.json"
    );
}

function saveToFile() {

}


function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    if (isShiftDown) {

        theta += mouse2D.x * 3;

    }

    camera.position.x = 1400 * Math.sin(theta * Math.PI / 360);
    camera.position.z = 1400 * Math.cos(theta * Math.PI / 360);
    camera.lookAt(target);

    raycaster = projector.pickingRay(mouse2D.clone(), camera);

    renderer.render(scene, camera);

}

function handleFileSelect(evt) {
    document.getElementById('fileUploadForm').submit();
}

function updateGrid(x, y) {
    clearGrid();
    createGrid(x, y);

    addSegment(new THREE.Vector3(-x, 0, -y));
    addSegment(new THREE.Vector3(x - step, 0, -y));
    addSegment(new THREE.Vector3(-x, 0, y - step));
    addSegment(new THREE.Vector3(x - step, 0, y - step));
    for (var i = -y + step; i < y - step; i += step) {
        addSegment(new THREE.Vector3(-x, 0, i));
        addSegment(new THREE.Vector3(x - step, 0, i));
    }
    for (var j = -x + step; j < x - step; j += step) {
        addSegment(new THREE.Vector3(j, 0, -y));
        addSegment(new THREE.Vector3(j, 0, y - step));
    }
}

////

var callbackFinished = function (result) {
    clearGrid();
    scene.remove(plane);
    loaded = result;

    for (var meshName in loaded.objects) {
        var mesh = eval("loaded.objects." + meshName);
        if (meshName != 'Grid' && meshName != 'Line') {
            scene.add(mesh);
        } else if (meshName == 'Grid') {
            createGrid(mesh.geometry.width / 2, mesh.geometry.height / 2)
        }
    }
}


function clearGrid() {
    var children = mainContainer.children.filter(function (e) {
        return (e.name.substring(0, 7) == "Segment");
    });
    children.forEach(function (e) {
        e.parent.remove(e);
    });
    for(i=groupContainer.length-1;i>=0;--i)
        scene.remove(groupContainer[i]);


}

function createGrid(x, y) {
    planeGeometryX = x;
    planeGeometryY = y;

    var geometry = new THREE.Geometry();

    for (var i = -y; i <= y; i += step) {
        geometry.vertices.push(new THREE.Vector3(-x, 0, i));
        geometry.vertices.push(new THREE.Vector3(x, 0, i));
    }
    for (var j = -x; j <= x; j += step) {
        geometry.vertices.push(new THREE.Vector3(j, 0, -y));
        geometry.vertices.push(new THREE.Vector3(j, 0, y));
    }

    mainContainer.remove(line);
    line = new THREE.Line(geometry, lineMaterial);
    line.type = THREE.LinePieces;
    line.name = "Line";
    mainContainer.add(line);

    mainContainer.remove(plane);
    plane = new THREE.Mesh(new THREE.PlaneGeometry(2 * x, 2 * y), new THREE.MeshBasicMaterial());
    plane.name = "Grid";
    plane.rotation.x = -Math.PI / 2;
    plane.visible = false;
    mainContainer.add(plane);
}

