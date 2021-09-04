//游戏主逻辑
var board = new Array();
var score = 0;
var hasConflicted = new Array(); //note:控制16个格子每个只能相等合并一次

var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;

$(document).ready(function () {
    prepareForMobile();
    newgame();
});

//用于替换伪协议
window.onload = function(){
    document.getElementById("newgamebutton").onclick = newgame;
}

function prepareForMobile(){

    if(documentWidth > 500)
    {
        $('header').css('width', 500);
        gridContainerWidth = 500;
        cellSpace = 20;
        cellSideLength = 100;
    }
    else
        $('.left').css('align-items', 'center');

    $('#grid-container').css('width', gridContainerWidth - 2*cellSpace);
    $('#grid-container').css('height', gridContainerWidth - 2*cellSpace);
    $('#grid-container').css('padding', cellSpace);
    $('#grid-container').css('border-radius', 0.02*gridContainerWidth);

    $('.grid-cell').css('width', cellSideLength);
    $('.grid-cell').css('height', cellSideLength);
    $('.grid-cell').css('border-radius', 0.02*cellSideLength);
}

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
                theNumberCell.css('top', getPosTop(i, j) + 0.5*cellSideLength);
                theNumberCell.css('left', getPosLeft(i, j) + 0.5*cellSideLength);
            }
            else{
                theNumberCell.css('width', cellSideLength);
                theNumberCell.css('height', cellSideLength);
                theNumberCell.css('top', getPosTop(i, j) );
                theNumberCell.css('left', getPosLeft(i, j) );
                theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                theNumberCell.text(board[i][j]);
            }

            hasConflicted[i][j] = false; //note:代表新的一轮开始
        }
    }

    $('.number-cell').css('line-height', cellSideLength+'px'); //todo:'px'可加可不加？
    $('.number-cell').css('font-size', 0.6*cellSideLength+'px');
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
            event.preventDefault(); //note:解决电脑分辨率较低出现滑动条后方向键同时导致滑动条滑动的现象，会关掉相应按键原本的默认设置(如方向键滑动滑动条)
            if( moveLeft() ) 
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 38: //up
            event.preventDefault();
            if( moveUp() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 39: //right
            event.preventDefault();
            if( moveRight() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
            break;
        case 40: //down
            event.preventDefault();
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

//js捕捉touchstart这个事件
document.addEventListener('touchstart', function(event){
    startx = event.touches[0].pageX;
    starty = event.touches[0].pageY;
});

//note:解决手指识别不管用的问题
document.addEventListener('touchstart', function(event){
    event.preventDefault();
});

//js捕捉touchend这个事件
document.addEventListener('touchend', function(event){
    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;

    var deltax = endx - startx;
    var deltay = endy - starty;

    //note:只有用户在屏幕上滑动足够距离才被判定为有效活动，单纯点击不算滑动
    if( Math.abs(deltax) < 0.3*documentWidth && Math.abs(deltay) < 0.3*documentWidth)
        return;

    //x
    if( Math.abs(deltax) >= Math.abs(deltay) )
    {
        if( deltax > 0)
        {
            //moveright
            if( moveRight() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
        }
        else
        {
            //moveleft
            if( moveLeft() ) 
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
        }
    }
    //y
    else
    {
        if( deltay > 0)
        {
            //moveDown
            if( moveDown() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
        }
        else
        {
            //moveUp
            if( moveUp() )
            {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            }
        }
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