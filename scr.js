
setMode('creatingMode');
var currentTexture;
var basenameCurrentTexture;

function setTexture(texture, basenameTexture)
{

    currentTexture = texture;
    basenameCurrentTexture = basenameTexture;
    console.log("curent" + basenameCurrentTexture);
}

function setMode(modeC) {
    document.getElementById('message').style.opacity='1';
    mode = modeC;
    var panels=["createPanel","editPanel","deletePanel", "scenePanel"];
    panels.forEach(function(entry) {
        var panel = document.getElementById(entry);
        panel.style.display= 'none';
    });

    var buttons=["create_button","modify_button","delete_button","scene_button"];
    buttons.forEach(function(entry){
        var kot=document.getElementById(entry);
        kot.classList.remove('active');
    });
    var panel;
    if (mode == "creatingMode") {
        panel = 'createPanel';
        document.getElementById('create_button').classList.add('active');

        document.getElementById('message').innerHTML='Click on grid to insert objects';

    }
    else if (mode == "selectionMode") {
        panel = 'editPanel';
        document.getElementById('modify_button').classList.add('active');
        document.getElementById('message').innerHTML='Select objects or walls to edit and choose action from panel';


    }
    else if (mode == "deletingMode") {
        panel = 'deletePanel';
        document.getElementById('delete_button').classList.add('active');
        document.getElementById('message').innerHTML='Click objects to delete';

    }
    else {
        var panel = 'scenePanel';
        document.getElementById('scene_button').classList.add('active');
        document.getElementById('message').innerHTML='You can know edit scene parameters.';


    }
    showBlock(panel);
    $('#message').fadeIn('slow').delay(5000).fadeOut('slow');

}


function showBlock(strPanel){
    var panel = document.getElementById(strPanel);
    panel.style.display= 'block'; }


function show(strPanel){
    var panel = document.getElementById(strPanel);
    panel.style.display= 'table'; }
function hide(strPanel){

    var panel = document.getElementById(strPanel);
    panel.style.display= 'none'; }


function setEditMode(Emode)
{
    editMode = Emode;
    console.log(editMode);
    if (editMode=="editingWalls"){
        document.getElementById("editVoxel").classList.remove('checked');
        hide("editVoxelCont");
        document.getElementById("editWalls").classList.add('checked');
        showBlock("editWallsCont");
    }
    else {
        document.getElementById("editWalls").classList.remove('checked');
        hide("editWallsCont");
        document.getElementById("editVoxel").classList.add('checked');
        showBlock("editVoxelCont");
    }


}

window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

var container;
var camera, scene, renderer, mainContainer;
var projector;
var mouse2D, mouse3D, raycaster, theta = 45, target = new THREE.Vector3(0, 200, 0);
var isShiftDown = false, selectionMode = false, isMouseDown = false, splitingMode = false, isRDown = false, deletingMode = false, isTDown = false, isYDown = false;
var ROLLOVERED, R;
var allObjectsOnScene = [];

step = 50, sceneHeight = 1, singleHeight = 1;

var selectedIndex = 0;
var groupContainer = [];



var selObj = new Object();
var selWalls = new Object();
var isSelected = 0;

var textur = THREE.ImageUtils.loadTexture(currentTexture);
textur.wrapS = textur.wrapT = THREE.RepeatWrapping;
textur.repeat.set(2, 2);
var definedMaterial = new THREE.MeshLambertMaterial({map: textur,
    color: 0xee0000, transparent: true, opacity: 1
});

function defineMaterial() {
    var lavaTexture = THREE.ImageUtils.loadTexture(currentTexture);
    // var texture = THREE.ImageUtils.loadTexture( 'models/macabann/chataigner.jpg' );
    lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set(document.getElementById('repeatX').value, document.getElementById('repeatY').value);
    var opacity = document.getElementById('matOpacity').value / 20.;
    console.log("color1" + definedMaterial.color.value);
    var matColor = document.getElementById('matColor').value;
    var color = new THREE.Color(matColor);
    var isTransparent = true;
    definedMaterial = new THREE.MeshLambertMaterial({map: lavaTexture,
        color: color, transparent: isTransparent, opacity: opacity, vertexColors: THREE.FaceColors
    });
    updateCurrentData(matColor, opacity);
}

function updateCurrentData(matColor, opacity) {
    //document.getElementById("currentTexture").innerHTML = basenameCurrentTexture;

    document.getElementById('chooseMaterial').style.backgroundImage='url(images/'+basenameCurrentTexture+')';
    document.getElementById('colorMaterial').style.backgroundColor=matColor;
    document.getElementById('chooseMaterial2').style.backgroundImage='url(images/'+basenameCurrentTexture+')';
    document.getElementById('colorMaterial2').style.backgroundColor=matColor;
}

var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.2
});
var split = false;
var seg = 0;

var normalMatrix = new THREE.Matrix3();

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    var form = document.createElement('div');
    form.innerHTML = '<div id="fileForm" style="display:none"><form id="fileUploadForm" enctype="multipart/form-data" action="/upload.php" method="POST"><input type="file" id="input" name="input" size="40"></form></div>'

    container.appendChild(form);
    heightController = document.getElementById('height');
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 800;
    scene = new THREE.Scene();
    mainContainer = new THREE.Object3D();
    scene.add(mainContainer);
    setLightRenderingAndPlane();

    setTexture("images/wall.jpg", "wall.jpg");
    defineMaterial();
    updateGrid(document.getElementById('sceneWidth').value, document.getElementById('sceneHeight').value);
    clearGrid();
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var intersects = raycaster.intersectObjects(allObjectsOnScene, true);
    var children = allObjectsOnScene;
    var prevcolor = new THREE.Color();    //console.log(children.length)
    var prevmat;
    if (editMode == "editingVoxel" && mode != "selectionMode")
    {
        if (intersects.length > 0) {
            if (ROLLOVERED) {
                for (var i = 0; i < 6; i ++)
                    ROLLOVERED.object.material.materials[i].emissive.setHex(0x000000);
            }
            ROLLOVERED = intersects[ 0 ];
            for (var i = 0; i < 6; i ++)
                ROLLOVERED.object.material.materials[i].emissive.setHex(0x00ffff);

        }
        else if (ROLLOVERED)
            for (var i = 0; i < 6; i ++)
                ROLLOVERED.object.material.materials[i].emissive.setHex(prevmat);
    }
    else if (editMode == "editingWalls" && mode != "selectionMode")
    {

        if (intersects.length > 0) {
            if (ROLLOVERED) {
                ROLLOVERED.face.color.setHex(prevcolor.getHex());
                ROLLOVERED.object.geometry.colorsNeedUpdate = true;

            }
            ROLLOVERED = intersects[ 0 ];
            prevcolor.setHex(ROLLOVERED.face.color.getHex());
            ROLLOVERED.face.color.setHex(0x00ffff);
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
        } else if (ROLLOVERED) {
            ROLLOVERED.face.color.setHex(prevcolor.getHex());
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
        }

    }

}

function onDocumentMouseDown(event) {
    event.preventDefault();
    if(window.event.which==1)
    {
        isMouseDown=true;
        createSegment();
    }
    else if(window.event.which==3) {//code for right click}"
        isShiftDown=true;
    }
}

function onDocumentMouseUp(event) {

    event.preventDefault();
    if(window.event.which==1)
    {
        isMouseDown=false;
        createSegment();
    }
    else if(window.event.which==3) {//code for right click}"
        isShiftDown=false;
    }
}

document.addEventListener("contextmenu", function(e){
    e.preventDefault();
}, false);

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = true;
            break;
        case 187:
            setMode("creatingMode");
            break;
        case 17:
            setMode("selectionMode");
            break;
        case 189:
            setMode("deletingMode");
            break;
        case 220:
            setMode("sceneMode");
            break;

        case 'R'.charCodeAt(0):
            isRDown = true;
            break;

        case 'G'.charCodeAt(0):
            createGroup();
            break;
        case 'H'.charCodeAt(0):
            splitGroup();
            break;
        case 'M'.charCodeAt(0):
            setMaterial1(definedMaterial);
            break;

        //ruch
        case 'I'.charCodeAt(0):
            modifyCubes(0, 1, 0);
            break;
        case 'K'.charCodeAt(0):
            modifyCubes(0, -1, 0);
            break;
        case 'D'.charCodeAt(0):
            modifyCubes(1, 0, 0);
            break;
        case 'A'.charCodeAt(0):
            modifyCubes(-1, 0, 0);
            break;
        case 'W'.charCodeAt(0):
            modifyCubes(0, 0, -1);
            break;
        case 'S'.charCodeAt(0):
            modifyCubes(0, 0, 1);
            break;
        case 'T'.charCodeAt(0):
            isTDown = true;
            break;
        case 'Y'.charCodeAt(0):

            isYDown = true;
            break;
    }
}

function onDocumentKeyUp(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = false;
            break;

        case 'T'.charCodeAt(0):
            isTDown = false;
            break;
        case 'Y'.charCodeAt(0):
            isYDown = false;
            break;
    }
}

function selectObjOrGroup(intersects) {
    if (editMode == "editingWalls")
    {
        Select(intersects);
    }
    else {
        if (intersects[0].object != plane) {

            if (intersects[0].object.parent == mainContainer)
                Select(intersects[0].object);
            else {
                selectedIndex = getIndex(intersects[0].object);
                for (var i = 0; i < intersects[0].object.parent.children.length; i++)
                    Select(intersects[0].object.parent.children[i]);

            }
        }
    }
}
function setTranspObjOrGroup(intersects) {
    if (intersects[0].object != plane) {
        if (intersects[0].object.parent == mainContainer)
            setTransparency(intersects[0].object, 0.7);
        else {

            for (var i = 0; i < intersects[0].object.parent.children.length; i++)
                setTransparency(intersects[0].object.parent.children[i], 0.7);

        }
    }
}
function setMaterialObjOrGroup(intersects) {
    if (intersects[0].object != plane) {
        if (intersects[0].object.parent == mainContainer)
            setMaterial(intersects[0].object, definedMaterial);
        else {

            for (var i = 0; i < intersects[0].object.parent.children.length; i++)
                setMaterial(intersects[0].object.parent.children[i], definedMaterial);

        }
    }
}
function deleteObjOrGroup(intersects) {
    if (intersects[0].object != plane) {
        if (intersects[0].object.parent == mainContainer)
            intersects[0].object.parent.remove(intersects[0].object);
        else {
            for (var i = intersects[0].object.parent.children.length - 1; i >= 0; --i)
                intersects[0].object.parent.parent.remove(intersects[0].object.parent);

        }
    }
}
function createSegment() {
    var intersects = raycaster.intersectObjects(scene.children, true);
    var INTERSECTED;

    if (intersects.length > 0) {
        var intersect = intersects[ 0 ];

        if (isMouseDown) {
            if (mode == "selectionMode") {
                if (editMode == "editingWalls")
                    Select(intersects[0]);
                else
                    selectObjOrGroup(intersects);
            }
            else if (isTDown) {
                setTranspObjOrGroup(intersects);
            }

            else if (isYDown) {
                setMaterialObjOrGroup(intersects);
            }
            else if (mode == "splitingMode") {
                if (intersects[0].object != plane) {
                    splitSegment(intersects[0].object);
                }
            }
            else if (mode == "deletingMode") {
                deleteObjOrGroup(intersects);
            }

            else if (mode == "creatingMode") {
                var position = new THREE.Vector3().add(intersects[0].point, intersects[0].object.matrixRotationWorld.multiplyVector3(intersects[0].face.normal.clone()));
                if (intersects[0].faceIndex != 2) {
                    addSegment(position);
                }
            }
        }
    }
}

function getIndex(obj) {
    for (i = 0; i < groupContainer.length; i++) {
        if (obj.parent == groupContainer[i]) {
            console.log("getindex:" + selectedIndex);
            selectedIndex = i;
            break;
        }
    }
    return selectedIndex;
}

function Select(obj) {

    if (obj != plane) {
        INTERSECTED = obj;
        console.log(INTERSECTED);
        console.log("select");
        switch (editMode)
        {
            case "editingVoxel":
                if (INTERSECTED.material.materials[0].emissive.getHex() == 0x000000) {
                    for (var i = 0; i < 6; i ++)
                        INTERSECTED.material.materials[i].emissive.setHex(0xff0000);

                    selObj[obj.name] = obj.name;

                }
                else {
                    console.log(INTERSECTED.material.materials[0].emissive.getHex());
                    for (var i = 0; i < 6; i ++)
                        INTERSECTED.material.materials[i].emissive.setHex(0x000000);

                    delete selObj[obj.name];

                }
                break;

            case "editingWalls":

                if (INTERSECTED.face.color.getHex() == 0xffffff)
                {
                    INTERSECTED.face.color.setHex(0xff0000);
                    INTERSECTED.object.geometry.colorsNeedUpdate = true;

                    selWalls[INTERSECTED.faceIndex + "_" + INTERSECTED.object.name] = INTERSECTED.faceIndex;

                }
                else
                {
                    INTERSECTED.face.color.setHex(0xffffff);
                    INTERSECTED.object.geometry.colorsNeedUpdate = true;
                    delete selWalls[INTERSECTED.faceIndex + "_" + INTERSECTED.object.name];
                }
                break;



        }
    }
}

function addSegment(position) {
    var material = new THREE.MeshLambertMaterial();
    material = definedMaterial.clone();
    var materials = [];

    for (var i = 0; i < 6; i++) {
        materials.push(material);
    }

    singleHeight = document.getElementById('singleHeight').value;
    x = document.getElementById('singleWidth').value;
    z = document.getElementById('singleLength').value;
    var geometry = new THREE.CubeGeometry(50*x, 50 * singleHeight, 50*z, 1, 1, 1, materials);
    seg++;
    console.log("ilosc seg:" + seg);

    var voxel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    voxel.name = "Segment_" + voxel.id;
    voxel.position.x = Math.floor(position.x / 50) * 50 + 25;
    voxel.position.y = Math.floor(position.y / 50) * 50 + 25;
    voxel.position.z = Math.floor(position.z / 50) * 50 + 25;
    voxel.matrixAutoUpdate = false;

    console.log(parseInt(singleHeight) * 50 / 2);
    voxel.position.y = parseInt(singleHeight) * 50 / 2;
    voxel.updateMatrix();
    mainContainer.add(voxel);
    var vox = new THREE.Object3D();
    vox = voxel;
    allObjectsOnScene.push(voxel);
}
function addSegmentSplited(position) {
    var material = new THREE.MeshLambertMaterial();
    material = definedMaterial.clone();
    var materials = [];

    for (var i = 0; i < 6; i++) {
        materials.push(material);
    }
    var geometry = new THREE.CubeGeometry(50, 50, 50);

    seg++;
    console.log("ilosc seg:" + seg);
    var voxel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    voxel.name = "Segment_" + voxel.id;
    voxel.position.x = position.x;
    voxel.position.y = position.y;
    voxel.position.z = position.z;
    voxel.matrixAutoUpdate = false;
    voxel.updateMatrix();
    mainContainer.add(voxel);
    var vox = new THREE.Object3D();
    vox = voxel;
    allObjectsOnScene.push(voxel);
}

function createGroup() {
    var children = mainContainer.children.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var tempContainer = new THREE.Object3D();
    children.forEach(function(e) {
        tempContainer.add(e);
    });
    groupContainer.push(tempContainer);
    console.log("create:" + groupContainer.length);
    scene.add(groupContainer[groupContainer.length - 1]);
}

function splitGroup() {
    console.log("selindex:" + selectedIndex);
    var children = groupContainer[selectedIndex].children;
    var length = children.length;
    for (var i = length - 1; i >= 0; i--) {
        mainContainer.add(children[i]);
        delete selObj[children.name];
    }
    delete groupContainer[selectedIndex];
    for (i = selectedIndex; i < groupContainer.length; i++) {
        groupContainer[i] = groupContainer[i + 1];
        groupContainer.length = groupContainer.length - 1;
    }
    console.log("split:" + groupContainer.length);
}


function splitSegment(voxel) {
    var obj = voxel;
    console.log(obj.material);
    var parts = obj.geometry.height / 50;
    console.log("parts " + parts);
    console.log(obj);
    split = true;
    if (parts > 1) {
        voxel.parent.remove(voxel);

        for (var i = 0; i < parts; i += 1) {
            var h = new THREE.Vector3(obj.position.x, 25 + i * 50, obj.position.z);

            addSegmentSplited(h);
        }
    }
    split = false;
}

function joinSegments() {
    if (isRDown) {

        var children = mainContainer.children.filter(function(e) {
            return (typeof selObj[e.name] != 'undefined');
        });

        var obj = children[0];
        var group = new THREE.Object3D();
        children.forEach(function(e) {
            group.add(e);
            mainContainer.remove(e);
        });
        mainContainer.add(group);
    }
}

var action = "none";

function setAction(actionC) {
    action = actionC;
    document.getElementById("translate").style.border="1px solid rgb(146, 99, 129)";
    document.getElementById("scale").style.border="1px solid rgb(146, 99, 129)";
    document.getElementById("rotate").style.border="1px solid rgb(146, 99, 129)";
    document.getElementById(action).style.border="1px solid  rgb(255,0,113)";
    document.getElementById(action).style.zIndex="17";
}

function modifyCubesIn() {

    var dx,dy,dz;

    if (action == "scale") {
        dx=document.getElementById("sx").value;
        dy=document.getElementById("sy").value;
        dz=document.getElementById("sz").value;
        scaleCubes(dx, dy, dz);
    }
    else if (action == "translate") {

        dx=document.getElementById("tx").value;
        dy=document.getElementById("ty").value;
        dz=document.getElementById("tz").value;
        translateCubes(dx, dy, dz);
    }
    else if (action == "rotate") {

        dx=document.getElementById("rx").value;
        dy=document.getElementById("ry").value;
        dz=document.getElementById("rz").value;
        rotateCubes(dx, dy, dz);
    }
    resetTransformationPanel();
}

function resetTransformationPanel(){
    setValue("sx",1);
    setValue("sy",1);
    setValue("sz",1);
    setValue("rx",0);
    setValue("ry",0);
    setValue("rz",0);
    setValue("ty",0);
    setValue("tx",0);
    setValue("tz",0);
}
function setValue(id,value){
    document.getElementById(id).value=value;
}

function modifyCubes(dx,dy,dz) {
    if (action == "scale") {
        scaleCubesA(dx, dy, dz);
    }
    else if (action == "translate") {

        translateCubes(dx, dy, dz);
    }
    else if (action == "rotate") {

        rotateCubes(dx, dy, dz);
    }
}
function scaleCubesA(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)
            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)
            continue;

        if ((child.scale.x < 1 && dx < 0) || (child.scale.y < 1 && dy < 0) || (child.scale.z < 1 && dz < 0))
            continue;
        child.scale.x += dx ;
        child.scale.y += dy ;
        child.scale.z += dz ;

        child.updateMatrix();
    }
}

function scaleCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)
            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)
            continue;

        if ((child.scale.x < 1 && dx < 0) || (child.scale.y < 1 && dy < 0) || (child.scale.z < 1 && dz < 0))
            continue;
        child.scale.x *= dx ;
        child.scale.y *= dy ;
        child.scale.z *= dz ;

        child.updateMatrix();
    }
}

function rotateCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)
            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)
            continue;

        child.rotation.x += dx * Math.PI / 180;
        child.rotation.y += dy * Math.PI / 180;
        child.rotation.z += dz * Math.PI / 180;

        child.updateMatrix();
    }
}


function deleteSelected() {
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    for (var i = children.length - 1; i >= 0; --i) {
        var child = children[i];
        if (child instanceof THREE.Mesh === false)
            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)
            continue;
        child.parent.remove(child);
        child.updateMatrix();

    }
}

function translateCubes(dx, dy, dz) {
    console.log("translateCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)
            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)
            continue;

        child.position.x += dx * 25;
        child.position.y += dy * 25;
        child.position.z += dz * 25;

        child.updateMatrix();
    }
}

function setTransparency(obj, opacity) {

    if (obj != plane) {
        INTERSECTED = obj;
        INTERSECTED.material.transparent = true;
        INTERSECTED.material.opacity = opacity;
    }
}

function setMaterial(obj, material) {
    if (obj != plane) {
        INTERSECTED = obj;
        var currentSelect = INTERSECTED.material.emissive.getHex();
        var materialNew = material.clone();
        materialNew.emissive.setHex(currentSelect);
        INTERSECTED.material = materialNew;
    }
}

function setMaterial1(material) {
    if (editMode == "editingVoxel") {
        var children = allObjectsOnScene.filter(function(e) {
            return (typeof selObj[e.name] != 'undefined');
        });
        children.forEach(function(e) {
            console.log(e.name);
            var currentSelect = e.material.materials[0].emissive.getHex();
            var materialNew = material.clone();
            materialNew.emissive.setHex(currentSelect);
            for (var i = 0; i < 6; i ++)
                e.material.materials[i] = materialNew;
        });
    }
    else if (editMode === "editingWalls") {
        var allSelFacesOnScene = [];
        var elements = allObjectsOnScene;
        for (var i = 0; i < elements.length; i++)
        {
            for (var j = 0; j < 6; j++)
                allSelFacesOnScene[i * 6 + j] = j + "_" + elements[i].name;
        }
        ;


        allSelFacesOnScene.forEach(function(e) {
            console.log(e);
        });
        var children = allSelFacesOnScene.filter(function(e) {

            return (typeof selWalls[e] !== 'undefined');
        });
        console.log("-----");
        children.forEach(function(e) {
            console.log(e);
        });

        children.forEach(function(e) {
            var elName = e.substr(2);
            console.log(elName);
            var ob = allObjectsOnScene.filter(function(f) {
                return (f.name.valueOf() === elName);

            });
            console.log("ob ");
            console.log(ob);
            console.log("sel walls " + selWalls[e]);
            var currentSelect = ob[0].material.materials[selWalls[e]].emissive.getHex();
            var materialNew = material.clone();
            materialNew.emissive.setHex(currentSelect);
            ob[0].material.materials[selWalls[e]] = materialNew;
        });

    }
}


function onHeightChange(event) {

    sceneHeight = event.srcElement.value;
    var children = allObjectsOnScene.filter(function(e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    console.log("liczba znalezionych dzieci: " + Object.getOwnPropertyNames(children).length);
    children.forEach(function(e) {
        console.log(e.name);
        var scale = e.scale.y;
        e.scale.y = parseInt(sceneHeight);
        e.position.y = e.geometry.height * e.scale.y / 2;
        e.updateMatrix();
    });
}


function clearGrid() {
    var children = mainContainer.children.filter(function(e) {
        return (e.name.substring(0, 7) == "Segment");
    });
    console.log("im here");
    children.forEach(function(e) {
        e.parent.remove(e);
    });
}

document.getElementById('input').addEventListener('change', handleFileSelect, false);
var loader = new THREE.SceneLoader();

loader.addGeometryHandler("ctm", THREE.CTMLoader);
loader.addGeometryHandler("vtk", THREE.VTKLoader);
loader.addGeometryHandler("stl", THREE.STLLoader);

loader.addHierarchyHandler("obj", THREE.OBJLoader);
loader.addHierarchyHandler("dae", THREE.ColladaLoader);
loader.addHierarchyHandler("utf8", THREE.UTF8Loader);

loader.load('test.json', callbackFinished);