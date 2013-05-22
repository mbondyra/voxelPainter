<?php
  $target_path = 'test.json';
  if ($_FILES['input']['error'] == UPLOAD_ERR_OK               //checks for errors
      && is_uploaded_file($_FILES['input']['tmp_name'])) { //checks that file is uploaded
    $data = file_get_contents($_FILES['input']['tmp_name']); 
    file_put_contents($target_path, $data);
  }
  header( 'Location: index.html' ) ;
?>
