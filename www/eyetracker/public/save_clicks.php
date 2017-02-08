<?php
	$postdata = file_get_contents("php://input");
	$fp = fopen("uploads/".$_GET["filename"], "wb");
	fwrite($fp, $postdata);
	fclose($fp);
?>

