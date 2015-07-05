<!DOCTYPE html>
<html>
<head>
    <title>Edytor map</title>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link href='http://fonts.googleapis.com/css?family=Orbitron' rel='stylesheet' type='text/css'>
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <link type="text/css" rel="stylesheet" href="css/style.css">
<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
</head>
<body>
    <div class="main_menu">
        <div class="row">
            <div class="option col-xs-3">
                <div id="create_button" class="button active" onclick="setMode('creatingMode')">+</div>
            </div>
            <div class="option col-xs-3">
                <div class="button" id="modify_button" onclick="setMode('selectionMode')">✎</div>
            </div>
            <div class="option col-xs-3">
                <div class="button" id="delete_button" onclick="setMode('deletingMode')">⌧</div>
            </div>
            <div class="option col-xs-3">
                <div class="button" id="scene_button" onclick="setMode('splitingMode')">☀</div>
            </div>
        </div>
        
        <div class="row">
            <div id="content">
                
                <div id="createPanel" class="panel">
                    <h1>CREATE MODE</h1>
                    <div  class="controls" >
                        <p>Width:<input type="number" name="singleWidth" id="singleWidth" value="1" min="0" max="100"> </p>
                        <p>Height:<input type="number" name="singleHeight" id="singleHeight" value="1" min="0" max="100"> </p>
                        <p>Length:<input type="number" name="singleLength" id="singleLength" value="1" min="0" max="100"> </p>
                    </div>
                </div>
                
                <div id="deletePanel" class="panel">
                    <h1>DELETE MODE</h1>
                </div>
                
                <div id="editPanel" class="panel">
                    <h1>EDIT MODE</h1>
                    <div id="actionPanel" class="panel">
                        <h2 id="editVoxel" onclick="setEditMode('editingVoxel')"> > Voxel Mode</h2>
                        <div id="editVoxelCont">
                            <h3>Transforms</h3><table id="transform">
                            <tr>
                                <th></th>
                                <th>x</th>
                                <th>y</th>
                                <th>z</th>
                                <th></th>
                            </tr>
                            <tr>
                                <td>
                                    <div onclick="setAction('translate')" id="translate">Translate </div>
                                </td>
                                <td>
                                    <input type="number" id="tx" value="0" onchange="translateCubes(document.getElementById('tx').value,document.getElementById('ty').value,document.getElementById('tz').value)">
                                </td>
                                <td>
                                    <input type="number" id="ty" value="0">
                                </td>
                                <td>
                                    <input type="number"  id="tz" value="0">
                                </td>
                                <td class="check_mark" onclick="setAction('translate');modifyCubesIn()">
                                    <div>✔</div>
                                </td>
                            </tr>
                            <tr>
                                <td><div onclick="setAction('scale')" id="scale">Scale</div> </td>
                                <td><input type="number" id="sx" value="1" min="0.25"></td>
                                <td><input type="number" id="sy" value="1" min="0.25"> </td>
                                <td><input type="number"  id="sz" value="1" min="0.25"></td>
                                <td class="check_mark" onclick="setAction('scale');modifyCubesIn()"><div>✔</div></td>
                            </tr>
                            <tr><td><div  onclick="setAction('rotate')"  id="rotate">Rotate </div></td>
                                <td><input type="number" id="rx" value="0"></td>
                                <td><input type="number" id="ry" value="0"> </td>
                                <td><input type="number"  id="rz" value="0"></td>
                                <td class="check_mark" onclick="setAction('rotate');modifyCubesIn()"><div>✔</div></td>
                            </tr>
                        </table>
                            <h3>Group</h3>
    
                            <button type="button" onclick="createGroup()">Create Group</button>
                            <br/>
                            <button type="button" onclick="splitGroup()">Split Group</button>
    
                            <!--   <h3>Spliting objects</h3>
                               <button type="button" onclick="splitMaterial()">Split horizontally</button>
                           -->
                            <h3>Material</h3>
                            <div class="row">
                                <button type="button" onclick="setMaterial1(definedMaterial);" class="col-xs-7">Apply</button>
                                <div id="chooseMaterial"  onclick='show("pop_up")' class="col-xs-3">
                                    <div id="colorMaterial" onclick='show("pop_up")'></div>
                                </div>
                            </div>
                        </div>
                        <h2 id="editWalls" onclick="setEditMode('editingWalls')" > > Walls Mode</h2>
                        <div id="editWallsCont">
                         <h3>Material</h3>
                                <div class="row">
                                    <button type="button" onclick="setMaterial1(definedMaterial);" class="col-xs-7">Apply</button>
                                    <div id="chooseMaterial2"  onclick='show("pop_up")' class="col-xs-3">
                                        <div id="colorMaterial2" onclick='show("pop_up")'></div>
                                    </div>
                                </div>
                                </div>
                    </div>
                </div>


                <div id="scenePanel" class="panel">
                    <h1>SCENE SETTINGS</h1>
                    <div  class="controls" >
                        <button onClick="clearGrid()">Clear All</button>
                        <p>Width:<input type="text" name="sceneWidth" id="sceneWidth" value="500"> </p>
                        <p>Height:<input type="text" name="sceneHeight" id="sceneHeight" value="500"> </p>
                        <button id="sceneSubmit" onClick="updateGrid(document.getElementById('sceneWidth').value, document.getElementById('sceneHeight').value)">Change Grid</button><br/>
                    </div>
                </div>

            </div>

        </div>

    </div>


    <div id="pop_up">
        <div class="pop_up_window col-xs-4 col-xs-offset-4">
            <h1 class="pop_up_title">
                EDIT MATERIAL
            </h1>
            <div class="pop_up_content row">
                <div id="materialPanel" class="panel">
                    <div id="textureMaterial">
                        <?
                                 $files = glob("images/*.*");
                                 for ($i = 1; $i < count($files); $i++) {
                                     $num = $files[$i];
                                     $bas = basename($num);
                                     echo '<img src="' . $num . '" alt="' . $bas . '" onclick="setTexture(this.src, this.alt)">' . "&nbsp;&nbsp;";
                        }
                        ?>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">repeats of texture (x,y)</div>
                        <div class="col-xs-6">
                            <input type="number" class="material" name="repeatY" id="repeatY" value='1' max='8'/>
                            <input type="number" class="material" name="repeatX" id="repeatX" value='1' max='8'/>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-xs-6">color(rgb)</div>
                        <div class="col-xs-6">
                            <input type="color" id="matColor" name="matColor" value="#ffffff">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Transparency</div>
                        <div class="col-xs-6">
                            <input type="range" name="matOpacity" id="matOpacity" value="20" min="0" max="20" >
                        </div>
                    </div>
                </div>
            </div>
            <div class="pop_up_nav row">
                <button class="col-xs-4 col-xs-offset-1" onclick="defineMaterial(); hide('pop_up')">OK</button>
                <button class="col-xs-4 col-xs-offset-2" onclick="hide('pop_up')">CANCEL</button>
            </div>
        </div>
    </div>

    <div id="message">
          YOU CAN NOW CREATE OBJECTS
    </div>
    
    <script src="js/vendor/three.min.js"></script>
    <script src="js/vendor/SceneExporter.js"></script>
    <script src="js/vendor/FileSaver.js"></script>

    <script src="js/loaders/ctm/lzma.js"></script>
    <script src="js/loaders/ctm/ctm.js"></script>
    <script src="js/loaders/ctm/CTMLoader.js"></script>

    <script src="js/loaders/OBJLoader.js"></script>
    <script src="js/loaders/VTKLoader.js"></script>
    <script src="js/loaders/STLLoader.js"></script>
    <script src="js/loaders/ColladaLoader.js"></script>
    <script src="js/loaders/UTF8Loader.js"></script>
    <script src="js/loaders/MTLLoader.js"></script>
    <script src="js/cameraSettings.js"></script>
    <script src="js/vendor/three.min.js"></script>

   <input type="range" name="height" id="height" value="1" min="0" max="10" style="display:none">
    <script src="scr.js"></script>
</body>
</html>
