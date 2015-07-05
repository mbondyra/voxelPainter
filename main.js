var mode="creatingMode";
var prevmode="creatingMode";
var editMode="editingVoxel";

var action="translate";

function setAction(actionC)
{
    action=actionC;
}

var currentTexture='images/crate.jpg';
var basenameCurrentTexture='crate.jpg';

function setTexture(texture, basenameTexture)
{

    currentTexture=texture;
    // if(texture='undefined') basenameTexture='default.jpg'
    basenameCurrentTexture=basenameTexture;
    console.log("curetn" +basenameCurrentTexture);
}

function setMode(modeC)
{
    mode=modeC;
}

function getMode(){
    return mode;
}

function setEditMode(Emode)
{
    editMode=Emode;
    console.log(editMode);
}
function getEditMode(){
    return editMode;
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


var map = THREE.ImageUtils.loadTexture('stone.jpg');
//zaznaczanie
var selObj = new Object();
var selWalls = new Object();
var isSelected = 0;

var textur=  THREE.ImageUtils.loadTexture(currentTexture);
textur.wrapS = textur.wrapT = THREE.RepeatWrapping;
textur.repeat.set( 2, 2 );
var definedMaterial = new THREE.MeshLambertMaterial({map:textur,
    color: 0xee0000, transparent:true, opacity:1
});

function defineMaterial(){
    var lavaTexture  = THREE.ImageUtils.loadTexture(currentTexture);
    // var texture = THREE.ImageUtils.loadTexture( 'models/macabann/chataigner.jpg' );
    lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set( document.getElementById('repeatX').value, document.getElementById('repeatY').value );
    var opacity=document.getElementById('matOpacity').value/20.;
    console.log("color1"+definedMaterial.color.value);
    var matRed= parseInt(document.getElementById('matRed').value);
    var matGreen= parseInt(document.getElementById('matGreen').value);
    var matBlue= parseInt(document.getElementById('matBlue').value);
    console.log("rgb:"+matRed+matGreen+matBlue);
    var color=new THREE.Color('rgb('+matRed+','+matGreen+','+matBlue+')');
    var isTransparent=true;
    definedMaterial = new THREE.MeshLambertMaterial({  map:lavaTexture ,
        color: color , transparent:isTransparent, opacity:opacity, vertexColors: THREE.FaceColors
    });
    updateCurrentData(matRed,matGreen,matBlue, opacity);
}

function updateCurrentData(r, g, b, opacity){
    document.getElementById("currentTexture").innerHTML=basenameCurrentTexture;
    document.getElementById("currentColor").innerHTML="rgb("+r+","+g+","+b+")";

    document.getElementById("currentOpacity").innerHTML=opacity;

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

    /*  var sceneControls = document.createElement('div');
     sceneControls.innerHTML = '*/
    var form = document.createElement('div');
    form.innerHTML = '<div id="fileForm" class="panel"><p>Specify a file, or a set of files:<br><form id="fileUploadForm" enctype="multipart/form-data" action="/upload.php" method="POST"><input type="file" id="input" name="input" size="40"></form></p></div>'

    container.appendChild(form);/*
     container.appendChild(sceneControls);*/

    heightController = document.getElementById('height');

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 800;

    /* camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
     camera.position.y = 800;
     camera.target.position.y = 200;

     camera = new THREE.TrackballCamera({

     fov: 25,
     aspect: window.innerWidth / window.innerHeight,
     near: 50,
     far: 1e7,

     rotateSpeed: 0.1,
     zoomSpeed: 1.2,
     panSpeed: 0.2,

     noZoom: false,
     noPan: false,

     staticMoving: false,
     dynamicDampingFactor: 1,

     keys: [ 'A'.charCodeAt(0), 'S'.charCodeAt(0), 'D'.charCodeAt(0) ], // [ rotateKey, zoomKey, panKey ],

     domElement: renderer.domElement,

     });*/

    scene = new THREE.Scene();
    mainContainer = new THREE.Object3D();
    scene.add(mainContainer);

    setLightRenderingAndPlane();
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    var intersects = raycaster.intersectObjects(allObjectsOnScene, true);



    var children = allObjectsOnScene;
    var prevcolor = new THREE.Color();    //console.log(children.length)
    var prevmat;
    if (editMode=="editingVoxel" && mode!="selectionMode")
    {
        if ( intersects.length > 0) {
            if (ROLLOVERED) {
                ROLLOVERED.object.material.emissive.setHex(0x000000);
            }

            ROLLOVERED = intersects[ 0 ];

            ROLLOVERED.object.material.emissive.setHex(0x00ffff);
        }
        else if(ROLLOVERED) for ( var i = 0; i < 6; i ++ ) ROLLOVERED.object.material.emissive.setHex(0x000000);
    }
    else if (editMode=="editingWalls" && mode!="selectionMode")
    {
        // console.log("1");
        if ( intersects.length > 0) {
            //console.log("2");
            if (ROLLOVERED) {
                //console.log("3");
                ROLLOVERED.face.color.setHex(prevcolor.getHex());
                ROLLOVERED.object.geometry.colorsNeedUpdate = true;
                //if (R) R.colorsNeedUpdate = true;
            }
            ROLLOVERED = intersects[ 0 ];
            prevcolor.setHex(ROLLOVERED.face.color.getHex());
            ROLLOVERED.face.color.setHex(0x00ffff);
            console.log(prevcolor.getHex());
            //R = intersects[ 0 ].object.geometry;
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
            //console.log("4");
        }
        else if(ROLLOVERED) {
            ROLLOVERED.face.color.setHex(prevcolor.getHex());
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
        }
    }
    createSegment();

}

function onDocumentMouseDown(event) {
    event.preventDefault();
    isMouseDown = true;
    createSegment();
}

function onDocumentMouseUp(event) {

    event.preventDefault();
    isMouseDown = false;
}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = true;
            break;
        case 18:
            mode="creatingMode";
            document.getElementById("create").checked="checked";

            break;
        case 17:
            mode="selectionMode";
            document.getElementById("select").checked="checked";

            break;
        case 'Q'.charCodeAt(0):
            mode="splitingMode";
            document.getElementById("split").checked="checked";

            break;
        case 'R'.charCodeAt(0):
            isRDown = true;
            break;
        case 46:
            mode="deletingMode";
            document.getElementById("delete").checked="checked";

            break;
        case 'M'.charCodeAt(0):
            createGroup();
            break;
        case 'N'.charCodeAt(0):
            splitGroup();
            break;
        case 'U'.charCodeAt(0):
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
    if (editMode=="editingWalls")
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
            if (mode=="selectionMode") {
                if (editMode=="editingWalls") Select(intersects[0]);
                else selectObjOrGroup(intersects);
            }
            else if (isTDown) {
                setTranspObjOrGroup(intersects);
            }

            else if (isYDown) {
                setMaterialObjOrGroup(intersects);
            }
            else if (mode=="splitingMode") {
                if (intersects[0].object != plane) {
                    splitSegment(intersects[0].object);
                }
            }
            else if (mode=="deletingMode") {
                deleteObjOrGroup(intersects);
            }

            else if (mode=="creatingMode"){

                /* normalMatrix.getNormalMatrix( intersect.object.matrixWorld );
                 var normal = intersect.face.normal.clone();
                 normal.applyMatrix3( normalMatrix ).normalize();
                 var position = new THREE.Vector3().addVectors( intersect.point, normal );
                 */
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
        switch(editMode)
        {
            case "editingVoxel":
                if (INTERSECTED.material.emissive.getHex() == 0x000000) {
                    INTERSECTED.material.emissive.setHex(0xff0000);
                    console.log("wselekcie" + selectedIndex);
                    selObj[obj.name] = obj.name;
                }
                else {
                    INTERSECTED.material.emissive.setHex(0x000000);
                    console.log("wunselekcie" + selectedIndex);
                    delete selObj[obj.name];
                }
                break;

            case "editingWalls":

                var matRed= parseInt(document.getElementById('matRed').value);
                var matGreen= parseInt(document.getElementById('matGreen').value);
                var matBlue= parseInt(document.getElementById('matBlue').value);
                console.log("rgb:"+matRed+matGreen+matBlue);
                var color=new THREE.Color('rgb('+matRed+','+matGreen+','+matBlue+')');


                var c = new THREE.Color();
                c.setHex(0xffffff);
                console.log("c " +c.getHex());
                console.log("editingWalls " +INTERSECTED.face.color.getHex());
                //if (INTERSECTED.face.color.getHex() == 0x65535) {
                INTERSECTED.face.color=color;
                INTERSECTED.object.geometry.colorsNeedUpdate = true;
                console.log("w ifie editingwalls "+INTERSECTED.face.color.getHex());
                //selWalls[INTERSECTED.object.name] = obj.name;
                // }
                /*  else {
                 INTERSECTED.face.color.setHex(0xffffff);
                 INTERSECTED.object.geometry.colorsNeedUpdate = true;
                 console.log("wunselekcie" + selectedIndex);
                 //delete selObj[obj.name];
                 }
                 }
                 */
                break;



        }
    }
}

/*function addSegment(position) {

 var material1 = new THREE.MeshLambertMaterial();
 material1=definedMaterial.clone();


 var material2 = new THREE.MeshLambertMaterial();
 material2=definedMaterial.clone();

 var materials = [material1, material2];

 var material = new THREE.MeshFaceMaterial(materials);

 singleHeight = document.getElementById('singleHeight').value;
 var geometry = new THREE.CubeGeometry(50, 50 * singleHeight, 50,1,1,1);
 seg++;
 console.log("ilosc seg:" + seg);
 var voxel = new THREE.Mesh(geometry, material);

 //materials[0]=  new THREE.MeshLambertMaterial({color: 0x000000});
 //materials.needsUpdate = true;
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

 }*/
function addSegment(position) {

    var material = new THREE.MeshLambertMaterial();
    material=definedMaterial.clone();


    singleHeight = document.getElementById('singleHeight').value;
    var geometry = new THREE.CubeGeometry(50, 50 * singleHeight, 50,1,1,1);
    seg++;
    console.log("ilosc seg:" + seg);
    var voxel = new THREE.Mesh(geometry, material);

    //materials[0]=  new THREE.MeshLambertMaterial({color: 0x000000});
    //materials.needsUpdate = true;
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

    var geometry = new THREE.CubeGeometry(50, 50, 50);

    seg++;
    console.log("ilosc seg:" + seg);


    var material = new THREE.MeshLambertMaterial();
    material=definedMaterial.clone();


    var voxel = new THREE.Mesh(geometry, material);
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
    var children = mainContainer.children.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var tempContainer = new THREE.Object3D();
    children.forEach(function (e) {
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

        var children = mainContainer.children.filter(function (e) {
            return (typeof selObj[e.name] != 'undefined');
        });

        var obj = children[0];
        var group = new THREE.Object3D();
        children.forEach(function (e) {
            group.add(e);
            mainContainer.remove(e);
        });
        mainContainer.add(group);
    }
}

function modifyCubes(dx,dy,dz){
    if (action=="scale")
        scaleCubes(dx, dy, dz);
    else if (action=="translate")
        translateCubes(dx,dy,dz);
    else if (action=="rotate")
        rotateCubes(dx, dy, dz);
}

function scaleCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;

        if ((child.scale.x<1 && dx<0) || (child.scale.y<1 && dy<0) || (child.scale.z<1 &&dz<0)) continue;
        child.scale.x += dx/2;
        child.scale.y += dy/2;
        child.scale.z += dz/2;

        child.updateMatrix();
    }
}

function rotateCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;


        child.rotation.x += dx * Math.PI / 180;
        child.rotation.y += dy * Math.PI / 180;
        child.rotation.z += dz * Math.PI / 180;

        child.updateMatrix();
    }
}


function deleteSelected() {
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    for (var i = children.length - 1; i >= 0; --i) {
        var child = children[i];
        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;


        child.parent.remove(child);
        child.updateMatrix();

    }
}


function translateCubes(dx, dy, dz) {
    console.log("translateCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;

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

function setMaterial1( material) {
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    children.forEach(function (e) {

        var currentSelect = e.material.emissive.getHex();
        var materialNew = material.clone();
        materialNew.emissive.setHex(currentSelect);
        e.material = materialNew;
    });
}

function onHeightChange(event) {

    sceneHeight = event.srcElement.value;

    //var children = scene.children.filter(function(e){ return (e.name.substring(0, 7) == "Segment"); });
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    console.log("liczba znalezionych dzieci: " + Object.getOwnPropertyNames(children).length);
    children.forEach(function (e) {
        console.log(e.name);
        var scale = e.scale.y;
        e.scale.y = parseInt(sceneHeight);
        e.position.y = e.geometry.height * e.scale.y / 2;
        e.updateMatrix();
    });
}


function clearGrid() {
    var children = mainContainer.children.filter(function (e) {
        return (e.name.substring(0, 7) == "Segment");
    });
    console.log("im here");
    children.forEach(function (e) {
        e.parent.remove(e);
    });
    /* for(i=groupContainer.length-1;i>=0;--i)
     scene.remove(groupContainer[i]);*/


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

/*<br><strong>click</strong>: add
 voxel,
 <strong>control + click</strong>: select voxel, <strong>shift</strong>: rotate, <br><strong>click+delete</strong>:
 remove,<strong>asdw</strong>: move, M- creates a group<br>*/var mode="creatingMode";
var prevmode="creatingMode";
var editMode="editingVoxel";

var action="translate";

function setAction(actionC)
{
    action=actionC;
}

var currentTexture='images/crate.jpg';
var basenameCurrentTexture='crate.jpg';

function setTexture(texture, basenameTexture)
{

    currentTexture=texture;
    // if(texture='undefined') basenameTexture='default.jpg'
    basenameCurrentTexture=basenameTexture;
    console.log("curetn" +basenameCurrentTexture);
}

function setMode(modeC)
{
    mode=modeC;
}

function getMode(){
    return mode;
}

function setEditMode(Emode)
{
    editMode=Emode;
    console.log(editMode);
}
function getEditMode(){
    return editMode;
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


var map = THREE.ImageUtils.loadTexture('stone.jpg');
//zaznaczanie
var selObj = new Object();
var selWalls = new Object();
var isSelected = 0;

var textur=  THREE.ImageUtils.loadTexture(currentTexture);
textur.wrapS = textur.wrapT = THREE.RepeatWrapping;
textur.repeat.set( 2, 2 );
var definedMaterial = new THREE.MeshLambertMaterial({map:textur,
    color: 0xee0000, transparent:true, opacity:1
});

function defineMaterial(){
    var lavaTexture  = THREE.ImageUtils.loadTexture(currentTexture);
    // var texture = THREE.ImageUtils.loadTexture( 'models/macabann/chataigner.jpg' );
    lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set( document.getElementById('repeatX').value, document.getElementById('repeatY').value );
    var opacity=document.getElementById('matOpacity').value/20.;
    console.log("color1"+definedMaterial.color.value);
    var matRed= parseInt(document.getElementById('matRed').value);
    var matGreen= parseInt(document.getElementById('matGreen').value);
    var matBlue= parseInt(document.getElementById('matBlue').value);
    console.log("rgb:"+matRed+matGreen+matBlue);
    var color=new THREE.Color('rgb('+matRed+','+matGreen+','+matBlue+')');
    var isTransparent=true;
    definedMaterial = new THREE.MeshLambertMaterial({  map:lavaTexture ,
        color: color , transparent:isTransparent, opacity:opacity, vertexColors: THREE.FaceColors
    });
    updateCurrentData(matRed,matGreen,matBlue, opacity);
}

function updateCurrentData(r, g, b, opacity){
    document.getElementById("currentTexture").innerHTML=basenameCurrentTexture;
    document.getElementById("currentColor").innerHTML="rgb("+r+","+g+","+b+")";

    document.getElementById("currentOpacity").innerHTML=opacity;

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

    /*  var sceneControls = document.createElement('div');
     sceneControls.innerHTML = '*/
    var form = document.createElement('div');
    form.innerHTML = '<div id="fileForm" class="panel"><p>Specify a file, or a set of files:<br><form id="fileUploadForm" enctype="multipart/form-data" action="/upload.php" method="POST"><input type="file" id="input" name="input" size="40"></form></p></div>'

    container.appendChild(form);/*
     container.appendChild(sceneControls);*/

    heightController = document.getElementById('height');

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 800;

    /* camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
     camera.position.y = 800;
     camera.target.position.y = 200;

     camera = new THREE.TrackballCamera({

     fov: 25,
     aspect: window.innerWidth / window.innerHeight,
     near: 50,
     far: 1e7,

     rotateSpeed: 0.1,
     zoomSpeed: 1.2,
     panSpeed: 0.2,

     noZoom: false,
     noPan: false,

     staticMoving: false,
     dynamicDampingFactor: 1,

     keys: [ 'A'.charCodeAt(0), 'S'.charCodeAt(0), 'D'.charCodeAt(0) ], // [ rotateKey, zoomKey, panKey ],

     domElement: renderer.domElement,

     });*/

    scene = new THREE.Scene();
    mainContainer = new THREE.Object3D();
    scene.add(mainContainer);

    setLightRenderingAndPlane();
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    var intersects = raycaster.intersectObjects(allObjectsOnScene, true);



    var children = allObjectsOnScene;
    var prevcolor = new THREE.Color();    //console.log(children.length)
    var prevmat;
    if (editMode=="editingVoxel" && mode!="selectionMode")
    {
        if ( intersects.length > 0) {
            if (ROLLOVERED) {
                ROLLOVERED.object.material.emissive.setHex(0x000000);
            }

            ROLLOVERED = intersects[ 0 ];

            ROLLOVERED.object.material.emissive.setHex(0x00ffff);
        }
        else if(ROLLOVERED) for ( var i = 0; i < 6; i ++ ) ROLLOVERED.object.material.emissive.setHex(0x000000);
    }
    else if (editMode=="editingWalls" && mode!="selectionMode")
    {
        // console.log("1");
        if ( intersects.length > 0) {
            //console.log("2");
            if (ROLLOVERED) {
                //console.log("3");
                ROLLOVERED.face.color.setHex(prevcolor.getHex());
                ROLLOVERED.object.geometry.colorsNeedUpdate = true;
                //if (R) R.colorsNeedUpdate = true;
            }
            ROLLOVERED = intersects[ 0 ];
            prevcolor.setHex(ROLLOVERED.face.color.getHex());
            ROLLOVERED.face.color.setHex(0x00ffff);
            console.log(prevcolor.getHex());
            //R = intersects[ 0 ].object.geometry;
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
            //console.log("4");
        }
        else if(ROLLOVERED) {
            ROLLOVERED.face.color.setHex(prevcolor.getHex());
            ROLLOVERED.object.geometry.colorsNeedUpdate = true;
        }
    }
    createSegment();

}

function onDocumentMouseDown(event) {
    event.preventDefault();
    isMouseDown = true;
    createSegment();
}

function onDocumentMouseUp(event) {

    event.preventDefault();
    isMouseDown = false;
}

function onDocumentKeyDown(event) {

    switch (event.keyCode) {

        case 16:
            isShiftDown = true;
            break;
        case 18:
            mode="creatingMode";
            document.getElementById("create").checked="checked";

            break;
        case 17:
            mode="selectionMode";
            document.getElementById("select").checked="checked";

            break;
        case 'Q'.charCodeAt(0):
            mode="splitingMode";
            document.getElementById("split").checked="checked";

            break;
        case 'R'.charCodeAt(0):
            isRDown = true;
            break;
        case 46:
            mode="deletingMode";
            document.getElementById("delete").checked="checked";

            break;
        case 'M'.charCodeAt(0):
            createGroup();
            break;
        case 'N'.charCodeAt(0):
            splitGroup();
            break;
        case 'U'.charCodeAt(0):
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
    if (editMode=="editingWalls")
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
            if (mode=="selectionMode") {
                if (editMode=="editingWalls") Select(intersects[0]);
                else selectObjOrGroup(intersects);
            }
            else if (isTDown) {
                setTranspObjOrGroup(intersects);
            }

            else if (isYDown) {
                setMaterialObjOrGroup(intersects);
            }
            else if (mode=="splitingMode") {
                if (intersects[0].object != plane) {
                    splitSegment(intersects[0].object);
                }
            }
            else if (mode=="deletingMode") {
                deleteObjOrGroup(intersects);
            }

            else if (mode=="creatingMode"){

                /* normalMatrix.getNormalMatrix( intersect.object.matrixWorld );
                 var normal = intersect.face.normal.clone();
                 normal.applyMatrix3( normalMatrix ).normalize();
                 var position = new THREE.Vector3().addVectors( intersect.point, normal );
                 */
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
        switch(editMode)
        {
            case "editingVoxel":
                if (INTERSECTED.material.emissive.getHex() == 0x000000) {
                    INTERSECTED.material.emissive.setHex(0xff0000);
                    console.log("wselekcie" + selectedIndex);
                    selObj[obj.name] = obj.name;
                }
                else {
                    INTERSECTED.material.emissive.setHex(0x000000);
                    console.log("wunselekcie" + selectedIndex);
                    delete selObj[obj.name];
                }
                break;

            case "editingWalls":

                var matRed= parseInt(document.getElementById('matRed').value);
                var matGreen= parseInt(document.getElementById('matGreen').value);
                var matBlue= parseInt(document.getElementById('matBlue').value);
                console.log("rgb:"+matRed+matGreen+matBlue);
                var color=new THREE.Color('rgb('+matRed+','+matGreen+','+matBlue+')');


                var c = new THREE.Color();
                c.setHex(0xffffff);
                console.log("c " +c.getHex());
                console.log("editingWalls " +INTERSECTED.face.color.getHex());
                //if (INTERSECTED.face.color.getHex() == 0x65535) {
                INTERSECTED.face.color=color;
                INTERSECTED.object.geometry.colorsNeedUpdate = true;
                console.log("w ifie editingwalls "+INTERSECTED.face.color.getHex());
                //selWalls[INTERSECTED.object.name] = obj.name;
                // }
                /*  else {
                 INTERSECTED.face.color.setHex(0xffffff);
                 INTERSECTED.object.geometry.colorsNeedUpdate = true;
                 console.log("wunselekcie" + selectedIndex);
                 //delete selObj[obj.name];
                 }
                 }
                 */
                break;



        }
    }
}

/*function addSegment(position) {

 var material1 = new THREE.MeshLambertMaterial();
 material1=definedMaterial.clone();


 var material2 = new THREE.MeshLambertMaterial();
 material2=definedMaterial.clone();

 var materials = [material1, material2];

 var material = new THREE.MeshFaceMaterial(materials);

 singleHeight = document.getElementById('singleHeight').value;
 var geometry = new THREE.CubeGeometry(50, 50 * singleHeight, 50,1,1,1);
 seg++;
 console.log("ilosc seg:" + seg);
 var voxel = new THREE.Mesh(geometry, material);

 //materials[0]=  new THREE.MeshLambertMaterial({color: 0x000000});
 //materials.needsUpdate = true;
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

 }*/
function addSegment(position) {

    var material = new THREE.MeshLambertMaterial();
    material=definedMaterial.clone();


    singleHeight = document.getElementById('singleHeight').value;
    var geometry = new THREE.CubeGeometry(50, 50 * singleHeight, 50,1,1,1);
    seg++;
    console.log("ilosc seg:" + seg);
    var voxel = new THREE.Mesh(geometry, material);

    //materials[0]=  new THREE.MeshLambertMaterial({color: 0x000000});
    //materials.needsUpdate = true;
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

    var geometry = new THREE.CubeGeometry(50, 50, 50);

    seg++;
    console.log("ilosc seg:" + seg);


    var material = new THREE.MeshLambertMaterial();
    material=definedMaterial.clone();


    var voxel = new THREE.Mesh(geometry, material);
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
    var children = mainContainer.children.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var tempContainer = new THREE.Object3D();
    children.forEach(function (e) {
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

        var children = mainContainer.children.filter(function (e) {
            return (typeof selObj[e.name] != 'undefined');
        });

        var obj = children[0];
        var group = new THREE.Object3D();
        children.forEach(function (e) {
            group.add(e);
            mainContainer.remove(e);
        });
        mainContainer.add(group);
    }
}

function modifyCubes(dx,dy,dz){
    if (action=="scale")
        scaleCubes(dx, dy, dz);
    else if (action=="translate")
        translateCubes(dx,dy,dz);
    else if (action=="rotate")
        rotateCubes(dx, dy, dz);
}

function scaleCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;

        if ((child.scale.x<1 && dx<0) || (child.scale.y<1 && dy<0) || (child.scale.z<1 &&dz<0)) continue;
        child.scale.x += dx/2;
        child.scale.y += dy/2;
        child.scale.z += dz/2;

        child.updateMatrix();
    }
}

function rotateCubes(dx, dy, dz) {
    console.log("scaleCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    var voxels = [];

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;


        child.rotation.x += dx * Math.PI / 180;
        child.rotation.y += dy * Math.PI / 180;
        child.rotation.z += dz * Math.PI / 180;

        child.updateMatrix();
    }
}


function deleteSelected() {
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    for (var i = children.length - 1; i >= 0; --i) {
        var child = children[i];
        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;


        child.parent.remove(child);
        child.updateMatrix();

    }
}


function translateCubes(dx, dy, dz) {
    console.log("translateCubes", dx, dy, dz)
    //var children = objects;
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child instanceof THREE.Mesh === false)            continue;
        if (child.geometry instanceof THREE.CubeGeometry === false)    continue;

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

function setMaterial1( material) {
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    children.forEach(function (e) {

        var currentSelect = e.material.emissive.getHex();
        var materialNew = material.clone();
        materialNew.emissive.setHex(currentSelect);
        e.material = materialNew;
    });
}

function onHeightChange(event) {

    sceneHeight = event.srcElement.value;

    //var children = scene.children.filter(function(e){ return (e.name.substring(0, 7) == "Segment"); });
    var children = allObjectsOnScene.filter(function (e) {
        return (typeof selObj[e.name] != 'undefined');
    });
    console.log("liczba znalezionych dzieci: " + Object.getOwnPropertyNames(children).length);
    children.forEach(function (e) {
        console.log(e.name);
        var scale = e.scale.y;
        e.scale.y = parseInt(sceneHeight);
        e.position.y = e.geometry.height * e.scale.y / 2;
        e.updateMatrix();
    });
}


function clearGrid() {
    var children = mainContainer.children.filter(function (e) {
        return (e.name.substring(0, 7) == "Segment");
    });
    console.log("im here");
    children.forEach(function (e) {
        e.parent.remove(e);
    });
    /* for(i=groupContainer.length-1;i>=0;--i)
     scene.remove(groupContainer[i]);*/


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

/*<br><strong>click</strong>: add
 voxel,
 <strong>control + click</strong>: select voxel, <strong>shift</strong>: rotate, <br><strong>click+delete</strong>:
 remove,<strong>asdw</strong>: move, M- creates a group<br>*/