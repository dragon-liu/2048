//游戏主逻辑
var board = new Array();
var score = 0;
var hasConflicted = new Array(); //note:控制16个格子每个只能相等合并一次

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
        hasConflicted[i] = new Array();
        for(var j = 0; j < 4; j++)
        {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }

    updateBoardView();

    score = 0;
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

            hasConflicted[i][j] = false; //note:代表新的一轮开始
        }
    }
}

function generateOneNumber(){

    if( nospace( board ) )
        return false;

    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    var times = 0;
    while(times < 50)
    {
        if(board[randx][randy] == 0)
            break;
        
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));

        times++;
    }

    if(times == 50){
        for( var i = 0; i < 4; i++)
            for(var j = 0; j < 4;j++)
                if( board[i][j] == 0 )
                {
                    randx = i;
                    randy = j;
                    //todo:不break则一直到最后一个空格才停止，但双层循环要2个break也不至于
                }
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
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 38: //up
            if( moveUp() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 39: //right
            if( moveRight() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 40: //down
            if( moveDown() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
 
        default: //default
            break;
    }
});

function isgameover(){
    if( nospace( board ) && nomove( board ))
        gameover();
}

function gameover(){
    alert("GameOver!");
}

/*note:注意4个方向都要保持相同的遍历模式，双层及三层循环要注意都是从不能移动的那一栏开始遍历，
我一开始left和其余方向模式不同，导致在另外3个方向移动时showMoveAnimation在“飘”，遍历方向一定是先靠近不能移动的遍历
边界处理和细节方面有些许不同*/
 
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
                    }                                                                  //note:没有合并过的格子才能相等合并
                    else if( board[i][k] == board[i][j] && noBlockHorizontal( i, k, j, board) && !hasConflicted[i][k] )
                    {
                        //moveleft
                        showMoveAnimation(i, j, i, k);

                        //add
                        board[i][k]+=board[i][j];
                        board[i][j] = 0;
                        
                        //add score
                        score += board[i][k];
                        updateScore( score );
                        
                        hasConflicted[i][k] = true;
                        continue;
                    }
                }

    /*note:因为计算机执行完上述语句只需要几ms，而showMoveAnimation需200ms才执行完，这里updateBoardView()需要等200ms,
    否则动画效果无法显示出来就被updateBoardView()给覆盖了*/

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
                    else if( board[k][j] == board[i][j] && noBlockVertical( j, k, i, board) && !hasConflicted[k][j] )
                    {
                        //moveUp
                        showMoveAnimation(i, j, k, j);

                        //add
                        board[k][j]+=board[i][j];
                        board[i][j] = 0;

                        //add score
                        score += board[k][j];
                        updateScore( score );

                        hasConflicted[k][j] = true;
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
                    else if( board[i][k] == board[i][j] && noBlockHorizontal( i, j, k, board) && !hasConflicted[i][k] )
                    {
                        //moveRight
                        showMoveAnimation(i, j, i, k);

                        //add
                        board[i][k]+=board[i][j];
                        board[i][j] = 0;

                        //add score
                        score += board[i][k];
                        updateScore( score );

                        hasConflicted[i][k] = true;
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
                    else if( board[k][j] == board[i][j] && noBlockVertical( j, i, k, board) && !hasConflicted[k][j] )
                    {
                        //moveDown
                        showMoveAnimation(i, j, k, j);

                        //add
                        board[k][j]+=board[i][j];
                        board[i][j] = 0;

                        //add score
                        score += board[k][j];
                        updateScore( score );

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }

    setTimeout("updateBoardView()", 200);
    return true;
}