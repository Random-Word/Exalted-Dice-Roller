defaults = [10,7,[]];

on("chat:message", function(msg) {
  //This allows players to enter !e <number> to roll a number of d10 dice with a target of 7.
  values = [];
  if(msg.type == "api" && msg.content.indexOf("!e") !== -1) {
    text = msg.content.replace("!e ","");
    data = text.split(":");
    
    if(data.length < 4) {
        sendChat(msg.who, "Usage: !e [number of dice]:[doubles number]:[target number]:[any];[reroll];[numbers]\n\
        Example: !e 12::: roll 12 dice as normal.\n\
        !e 22:8::1 roll 22 dice, double 8's, and re-roll 1's until they no longer appear.")
        return;
    }
    
    numDice = data[0];
    doublesNum = data[1] == "" ? defaults[0] : data[1].indexOf(";") != -1 ? data[1].split(";") : data[1];
    targetNum = data[2] == "" ? defaults[1] : data[2];
    rerollNum = data[3] == "" ? defaults[2] : (data[3].indexOf(";") != -1 ? data[3].split(";") : [data[3]]);
    
    for(var i=0; i<rerollNum.length; i++) { rerollNum[i] = +rerollNum[i]; } 
    
    result = ex_roll(numDice, doublesNum, targetNum, rerollNum);
    
    roll_call(msg.who, result.rolls, result.hits, numDice, doublesNum, targetNum, rerollNum);
    
    sendChat(msg.who, "Rolling: " + numDice + " dice, double " + doublesNum +
    "'s, rerolling " + rerollNum.toString() + "\nRolls: " + 
    result.rolls.toString() + "\nSuccesses: " + result.hits);
  }
});

function ex_roll(numDice, doublesNum, targetNum, rerollNum) {
    log("-----BEGIN ROLL-----");
    return _ex_roll(numDice, doublesNum, targetNum, rerollNum)
}

function _ex_roll(numDice, doublesNum, targetNum, rerollNum) {
    if (numDice == 0) {return {hits: 0, rolls: []}};
    result = _ex_roll(numDice-1, doublesNum, targetNum, rerollNum);
    roll = randomInteger(10);
    rolls = [roll];
    //log("Rolled: " + roll);
    while (rerollNum.length > 0 && rerollNum.indexOf(roll) != -1) {
        roll = randomInteger(10);
        rolls.push(roll);
        //log("Rerolling; Rolled: " + roll);
    }
    hits = roll >= doublesNum ? 2 : roll >= targetNum ? 1 : 0;
    //log("Resulting in " + hits + " hits.");
    //log("Total hits: " + (result.hits + hits));
    return ({hits: result.hits+hits, rolls: result.rolls.concat(rolls)});
}

function gen_dice_html(value, index, doublesNum, targetNum, rerollNum) {
    color = black;
    if (rerollNum.indexOf(parseInt(value)) != -1) {
        color="#730505";
    }
    if (value >= targetNum) {
        color = "#052473";
    }
    if (value >= doublesNum) {
        color="#247305";
    }
    
    var dicerollStyle = "display:inline-block;font-size:1.2em;font-family:san-sarif10";
    var diconStyle = "display:inline-block;min-width:30px;text-align:center;position:relative";
    var didrollStyle = "text-shadow:-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff,1px 1px 1px #fff;z-index:2;position:relative;color:"+color+";height:30px;min-height:29px;margin-top:-3px;top:0;text-align:center;font size=16px;font-family:sans-serif;";
    var backingStyle = "position:absolute;top:-2px;left:0;width:100%;text-align:center;font-size:30px;color:#8fb1d9;text-shadow:0 0 3px #8fb1d9;opacity:.75;pointer-events:none;z-index:1";
    var html = "";
    html += "      (<div data-origindex=\"" + index + "\" style=\"" + dicerollStyle + "\" class=\"diceroll d10\">";
    html += "          <div style=\"" + diconStyle + "\">";
    html += "             <div class=\"backing\"></div>"
    html += "             <div style=\"" + didrollStyle + "\">"
    if ((rerollNum.indexOf(value) != -1)||(value>=doublesNum)||(value>=targetNum)){
        html+= "<strong>"
    }
    html += value + "</strong></div>";
    html += "             <div style=\"" + backingStyle + "\"></div>";
    html += "          </div>";
    html += "       </div>)";
    return html;
}

function roll_call(who, rolls, hits, numDice, doublesNum, targetNum, rerollNum) {
    var color="black"
    
    var formulaStyle = "font-size:inherit;display:inline;padding:4px;background:white;border-radius:3px;";
    var totalStyle = formulaStyle;
    totalStyle += "border:1px solid #d1d1d1;cursor:move;font-size:1.4em;font-weight:bold;color:black;line-height:2.0em;";
 
    formulaStyle += "border:1px solid #d1d1d1;font-size:1.1em;line-height:2.0em;word-wrap:break-word;";
    var clearStyle = "clear:both";
    var formattedFormulaStyle = "display:block;float:left;";
    var dicegroupingStyle = "display:inline;margin-right:-4px;";
    var uisortableStyle = "cursor:move";
    
    var rolledStyle = "cursor:move;font-weight:bold;color:black;font-size:1.3em";
    var uidraggableStyle = "cursor:move";
    
    var html = "<div style=\"" + formulaStyle + "\"> rolling " + numDice + "d10 </div>";
    html += "<div style=\"" + clearStyle + "\"></div>";
    html += "<div style=\"" + formulaStyle + ";" + formattedFormulaStyle + "\">";
    html += "   <div style=\"" + dicegroupingStyle + ";" + uisortableStyle + "\" data-groupindex=\"0\">";
    for (var i = 0; i < rolls.length; i++) {
        html += gen_dice_html(rolls[i], i, doublesNum, targetNum, rerollNum)
    }
    html += "   </div>";
    html += "</div>";
    html += "<div style=\"" + clearStyle + "\"></div><strong> = </strong><div style=\"" + totalStyle + ";" + uidraggableStyle + "\"><strong><font size=\"6\"> " + hits + "</strong> </div>";
    
    log(html);
    sendChat(who, "/direct " + html); 
}
