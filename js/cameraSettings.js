
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
    parent1.add(plane);

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

    var directionalLight = new THREE.DirectionalLight(0x808080);
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    scene.add(directionalLight);
    scene.add(container2);

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

    //window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
    //THREE.SceneExporter.function();
}

//

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