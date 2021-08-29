//游戏主逻辑
var board = new Array();
var score = 0;

$(document).ready(function () {
    newgame();
});


function newgame(){
    //初始化整个棋盘
    init();

    //随机在2个格子生成数字
    generateOneNumber();
    generateOneNumber();
}

function init(){
    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            var gridCell = $("#grid-cell-" + i + "-" + j);
            gridCell.css("top", getPosTop(i, j));
            gridCell.css("left", getPosLeft(i, j));
        }
    }

    for(var i = 0; i < 4; i++)
    {
        board[i] = new Array();
        for(var j = 0; j < 4; j++)
        {
            board[i][j] = 0;
        }
    }

    updateBoardView();
}

function updateBoardView(){

    $('.number-cell').remove();
    for(var i = 0; i < 4; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            $('#grid-container').append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>'); //todo:jQuery粘连字符串语法
            var theNumberCell = $('#number-cell-' + i + '-' + j);

            if(board[i][j] == 0){
                theNumberCell.css('width', '0px');
                theNumberCell.css('height', '0px');
                theNumberCell.css('top', getPosTop(i, j) + 50);
                theNumberCell.css('left', getPosLeft(i, j) + 50);
            }
            else{
                theNumberCell.css('width', '100px');
                theNumberCell.css('height', '100px');
                theNumberCell.css('top', getPosTop(i, j) );
                theNumberCell.css('left', getPosLeft(i, j) );
                theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                theNumberCell.text(board[i][j]);
            }
        }
    }
}

function generateOneNumber(){

    if( nospace( board ) )
        return false;

    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    while(true)
    {
        if(board[randx][randy] == 0)
            break;
        
            randx = parseInt(Math.floor(Math.random() * 4));
            randy = parseInt(Math.floor(Math.random() * 4));
    }

    //随机一个数字2或4
    var randNumber = Math.random() < 0.5 ? 2 : 4;

    //在随机位置显示该数字
    board[randx][randy] = randNumber;
    showNumberWithAnimation(randx, randy, randNumber);

    return true;
}

//2048游戏运行逻辑属于响应式循环，根据玩家触发的事件来做出反应，而js本身就可以捕捉到相应事件，很方便
$(document).keydown(function ( event ) { 
    switch(event.keyCode){
        case 37: //left
            if( moveLeft() ) 
            {
                generateOneNumber();
                isgameover();
            }
            break;
        case 38: //up
            if( moveUp() )
            {
                generateOneNumber();
                isgameover();
            }
            break;
        case 39: //right
            if( moveRight() )
            {
                generateOneNumber();
                isgameover();
            }
            break;
        case 40: //down
            if( moveDown() )
            {
                generateOneNumber();
                isgameover();
            }
            break;
 
        default: //default
            break;
    }
});

function isgameover(){

}

/*note:注意4个方向都要保持相同的遍历模式，双层及三层循环要注意都是从不能移动的那一栏开始遍历，
我一开始left和其余方向模式不同，导致在另外3个方向移动时showMoveAnimation在“飘”，遍历方向一定是先靠近不能移动的遍历*/
function moveLeft(){

    if( !canMoveLeft( board ) )
        return false;

    //moveLeft
    for(var i = 0; i < 4; i++)
        for(var j=1; j < 4; j++)
            if(board[i][j] != 0)

                for(var k = 0; k < j; k++)
                {
                    if( board[i][k] == 0 && noBlockHorizontal( i, k, j, board) )
                    {
                        //moveLeft
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[i][k] == board[i][j] && noBlockHorizontal( i, k, j, board) )
                    {
                        //moveleft
                        showMoveAnimation(i, j, i, k);

                        //add
                        board[i][k]+=board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                }

    setTimeout("updateBoardView()", 200);
    return true;
}

function moveUp(){

    if( !canMoveUp( board ) )
        return false;

    //moveUp
    for(var j = 0; j < 4; j++)
        for(var i=1; i < 4; i++)
            if(board[i][j] != 0)

                for(var k = 0; k < i; k++)
                {
                    if( board[k][j] == 0 && noBlockVertical( j, k, i, board) )
                    {
                        //moveUp
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[k][j] == board[i][j] && noBlockVertical( j, k, i, board) )
                    {
                        //moveUp
                        showMoveAnimation(i, j, k, j);

                        //add
                        board[k][j]+=board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                }

    setTimeout("updateBoardView()", 200);
    return true;
}

function moveRight(){

    if( !canMoveRight( board ) )
        return false;

    //moveRight
    for(var i = 0; i < 4; i++)
        for(var j=2; j >= 0; j--)
            if(board[i][j] != 0)

                for(var k = 3; k > j; k--)
                {
                    if( board[i][k] == 0 && noBlockHorizontal( i, j, k, board) )
                    {
                        //moveRight
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[i][k] == board[i][j] && noBlockHorizontal( i, j, k, board) )
                    {
                        //moveRight
                        showMoveAnimation(i, j, i, k);

                        //add
                        board[i][k]+=board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                }

    setTimeout("updateBoardView()", 200);
    return true;
}

function moveDown(){

    if( !canMoveDown( board ) )
        return false;

    //moveDown
    for(var j = 0; j < 4; j++)
        for(var i = 2; i >= 0; i--)
            if(board[i][j] != 0)

                for(var k = 3; k > i; k--)
                {
                    if( board[k][j] == 0 && noBlockVertical( j, i, k, board) )
                    {
                        //moveDown
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if( board[k][j] == board[i][j] && noBlockVertical( j, i, k, board) )
                    {
                        //moveDown
                        showMoveAnimation(i, j, k, j);

                        //add
                        board[k][j]+=board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                }

    setTimeout("updateBoardView()", 200);
    return true;
}