<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require './vendor/autoload.php';
require './db.php';

$app = new \Slim\App;

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Add CORS Support
// $app->add(function ($req, $res, $next) {
//     $response = $next($req, $res);
//     return $response
//             ->withHeader('Access-Control-Allow-Origin', '*')
//             ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
//             ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// });

$app->get('/', function(Request $request, Response $response){
    echo file_get_contents("ereum.htm");
});

$app->get('/api', function(Request $request, Response $response){
    $headerValueArray = $request->getHeader('Authorize');
    $userid = authenticate($headerValueArray);
    if ($userid != 0) {
        $sql = "SELECT * FROM Names ORDER BY `created` DESC";
        try{
            $db = new db();
            $db = $db->connect();
            $stmt = $db->query($sql);
            $habits = $stmt->fetchAll(PDO::FETCH_OBJ);
            echo json_encode($habits);
        } catch(PDOException $e){
            echo '{"status":"500","message":'.$e->getMessage().'}';
        }
    } else {
        echo '{"status":"401","message":"Invalid Authentication Token: ' . print_r($headerValueArray) . '"}';
    }
});

$app->get('/api/{nameid}', function(Request $request, Response $response){
    $nameid = $request->getAttribute('nameid');
    $headerValueArray = $request->getHeader('Authorize');
    $userid = authenticate($headerValueArray);
    if ($userid != 0) {
        $sql = "SELECT * FROM Names WHERE `id` = $nameid";
        try{
            $db = new db();
            $db = $db->connect();
            $stmt = $db->query($sql);
            $habits = $stmt->fetchAll(PDO::FETCH_OBJ);
            echo json_encode($habits);
        } catch(PDOException $e){
            echo '{"status":"500","message":'.$e->getMessage().'}';
        }
    } else {
        echo '{"status":"401","message":"Invalid Authentication Token: ' . print_r($headerValueArray) . '"}';
    }
});

$app->post('/api', function(Request $request, Response $response){
    $headerValueArray = $request->getHeader('Authorize');
    $userid = authenticate($headerValueArray);
    if ($userid != 0) {
        $body = $request->getBody();
        $data = json_decode($body, true);
        $nameid = $data["id"];
        $fullname = $data["fullname"];
        $date = $data["date"];
        $tags = $data["tags"];

        if ($nameid) {
            $sql = "UPDATE `Names` SET `created` = '$date', `fullname` = '$fullname', `tags` = '$tags' WHERE `id` = $nameid";
            try {
                $db = new db();
                $db = $db->connect();
                $stmt = $db->prepare($sql);
                $stmt->execute();
                echo '{"status":"200","message":"Successfully updated record"}';
            } catch(PDOException $e){
                echo '{"status":"500","message":'.$e->getMessage().'}';
            }
        } else {
            $sql = "INSERT INTO `Names` (`fullname`,`created`,`tags`) VALUES ('$fullname', $date, '$tags')";
            try {
                $db = new db();
                $db = $db->connect();
                $stmt = $db->prepare($sql);
                $stmt->execute();
                echo '{"status":"200","message":"Successfully added record"}';
            } catch(PDOException $e){
                echo '{"status":"500","message":'.$e->getMessage().'}';
            }
        }
    } else {
        echo '{"status":"401","message":"Invalid Authentication Token: ' . print_r($headerValueArray) . '"}';
    }
});


$app->post('/api/checklogin', function(Request $request, Response $response){
    $headerValueArray = $request->getHeader('Authorize');
    $userid = authenticate($headerValueArray);
    if ($userid != 0) {
        echo '{"status":"200","message":"Valid Token"}';
    } else {
        echo '{"status":"401","message":"Invalid Authentication Token"}';
    }
});

function authenticate($tokens) {
    $userid = 0;
    if (count($tokens) > 0) {
        $token = $tokens[0];
        $sql = "SELECT * FROM Logins";
        try{
            $db = new db();
            $db = $db->connect();
            $stmt = $db->query($sql);
            $logins = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($logins as $login) {
                if ($login->login == $token) {
                    $userid = $login->id;
                    break;
                }
            }
        } catch(PDOException $e){
            echo '{"status":"500","message":'.$e->getMessage().'}';
        }
    }
    return $userid;
}

$app->run();
?>