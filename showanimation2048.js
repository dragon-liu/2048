//动画效果逻辑
function showNumberWithAnimation(i, j, randNumber ){

    //note:通过jQuery获取元素时id选择器记得带#
    var numberCell = $('#number-cell-' + i + '-' + j);

    numberCell.css('background-color', getNumberBackgroundColor(randNumber));
    numberCell.css('color', getNumberColor(randNumber));
    numberCell.text(randNumber);

    //动画效果用iQuery.animate来实现
    numberCell.animate({
        width:cellSideLength,
        height:cellSideLength,
        top:getPosTop(i, j),
        left:getPosLeft(i, j)
    }, 50);

}

function showMoveAnimation( fromx, fromy, tox, toy){

    var numberCell = $('#number-cell-' + fromx + '-' + fromy);
    numberCell.animate({
        top:getPosTop(tox, toy),
        left:getPosLeft(tox, toy)
    }, 200);
}

function updateScore( score ){

    $('#score').text(score);
}
