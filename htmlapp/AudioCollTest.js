var svg; 
var SVGDOM;

function InitColl(){
    svg = document.getElementById('artwork');
    SVGDOM = svg.contentDocument;
}

function CollTest(x,y){
    function isContainedInBounds(x1,x2,y1,y2){
        return (x>=x1)&&(x<=x2)&&(y>=y1)&&(y<=y2)
    }
    
    var buf = -1;
    var eles = document.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
    for(ele of eles){
        if(ele.parentElement!==null){
            switch(ele.parentElement.id){
                case "6BWS":
                    return 5;
                case "8GSST":
                    return 7;
                case "9BOBASSST":
                    return 8;
                case "11RpAC":
                    return 10;
                case "12VAR":
                    return 11;
                case "13SSSAA":
                    return 12;
                case "14CCIICS":
                    return 13;
                case "15BCAD":
                    return 14;
                case "16GD":
                    return 15;
                case "17ASRD":
                    return 16;
                case "19ASBMA":
                    return 17;
                case "20WUFIA":
                    return 18;
                case "25DII":
                    return 22;
                case "28HDE":
                    return 25;
                case "29TUI":
                    return 24;
                case "30RI":
                    return 25;
                case "32DCB":
                    return 26;
                case "33RIB":
                    return 27;
                case "35CCWU":
                    return 28;
                case "36RRT":
                    return 29;
                case "37MBILT":
                    return 30;
                case "38CE":
                    return 31;
                case "43GPDBEIS":
                    return 33;
                case "44GPDBEIF":
                    return 35;
                case "45HMICOG":
                    return 36;
                case "46ISG":
                    return 37;
                case "50ARII":
                    return 39;
                case "52XIIM":
                    return 40;
                case "53BWC":
                    return 41;
                case "54MIBW":
                    return 42;
                case "58AOHIGOM":
                    return 43;
                case "60FPBFTR":
                    return 44;
                case "63SPIO":
                    return 46;
            }
        }
    }
    if(isContainedInBounds(0,0,1526,1028)) //Zone1
        buf = getBaseline(1);
    //Water molecule before water in space
    else if(isContainedInBounds(853,1329,456,756))
        buf = 0;
    else if(isContainedInBounds(687,922,694,910))
        buf = 0;
    else if(isContainedInBounds(433,917,910,1028))
        buf = 0;
    else if(isContainedInBounds(562,808,591,700)) //DNA1
        buf = 1;
    else if(isContainedInBounds(1119,1526,173,556))//water in space sample
        buf = 2;
    else if(isContainedInBounds(1420,1594,718,952))//DNA 2
        buf = 1;
    //Water Molecule under Water Access VS GDP
    else if(isContainedInBounds(1413,1667,624,744))
        buf = 0;
    else if(isContainedInBounds(1609,1851,720,951))
        buf = 0;
    
    else if(isContainedInBounds(1537, 2674, 0,1028))//Zone2
    
        buf = getBaseline(2);
        //Industrial Agriculture linking
        if(isContainedInBounds(2151,2208,441,515))
            buf = 4;
        else if(isContainedInBounds(2151,2208,536,605))
            buf = 4;
        else if(isContainedInBounds(2151,2208,629,701))
            buf = 4;
        else if(isContainedInBounds(2151,2208,721,795))
            buf = 4;
        else if(isContainedInBounds(2239,2294,441,515))
            buf = 4;
        else if(isContainedInBounds(2239,2294,563,605))
            buf = 4;
        else if(isContainedInBounds(2239,2294,629,701))
            buf = 4;
        else if(isContainedInBounds(2239,2294,721,795))
            buf = 4;
        else if(isContainedInBounds(2326,2383,441,515))
            buf = 4;
        else if(isContainedInBounds(2326,2383,563,605))
            buf = 4;
        else if(isContainedInBounds(2326,2383,629,701))
            buf = 4;
        else if(isContainedInBounds(2326,2383,721,795))
            buf = 4;
        else if(isContainedInBounds(2413,2471,441,515))
            buf = 4;
        else if(isContainedInBounds(2413,2471,563,605))
            buf = 4;
        else if(isContainedInBounds(2413,2471,629,701))
            buf = 4;
        else if(isContainedInBounds(2413,2471,721,795))
            buf = 4;
        else if(isContainedInBounds(2501,2559,441,515))
            buf = 4;
        else if(isContainedInBounds(2501,2559,563,605))
            buf = 4;
        else if(isContainedInBounds(2501,2559,629,701))
            buf = 4;
        else if(isContainedInBounds(2501,2559,721,795))
            buf = 4;
        else if(isContainedInBounds(2590,2647,441,515))
            buf = 4;
        else if(isContainedInBounds(2590,2647,563,605))
            buf = 4;
        else if(isContainedInBounds(2590,2647,629,701))
            buf = 4;
        else if(isContainedInBounds(2590,2647,721,795))
            buf = 4;

        //Water Access VS GDP
        if(isContainedInBounds(1541,1580,286,568))
            buf = 3;
        else if(isContainedInBounds(1613,1653,280,570))
            buf = 3;
        else if(isContainedInBounds(1682,1726,269,570))
            buf = 3;
        else if(isContainedInBounds(1750,1798,261,570))
            buf = 3;
        else if(isContainedInBounds(1830,1869,248,570))
            buf = 3;
        else if(isContainedInBounds(1898,1941,226,570))
            buf = 3;
        else if(isContainedInBounds(1967,2015,221,570))
            buf = 3;
        else if(isContainedInBounds(2038,2087,200,570))
            buf = 3;
        else if(isContainedInBounds(2110,2161,180,570))
            buf = 3;
        else if(isContainedInBounds(2181,2233,170,570))
            buf = 3;
        else if(isContainedInBounds(2251,2305,180,570))
            buf = 3;
        else if(isContainedInBounds(2395,2450,148,570))
            buf = 3;
        
        //CO2 Emissions through thte years (zone2)
        if(isContainedInBounds(1888,2166,676,701))
            buf = 6;
        else if(isContainedInBounds(2213,2290,619,721))
            buf = 6;
        else if(isContainedInBounds(2290,2290,500,721))
            buf = 6;
        else if(isContainedInBounds(2290,2290,500,721))
            buf = 6;
        //Baseline water stress(Zone 2)
        if(isContainedInBounds(1903,1997,567,660))
            buf = 5;
        else if(isContainedInBounds(2071,2163,519,606))
            buf = 5;
        else if(isContainedInBounds(2265,2354,613,703))
            buf = 5;
        else if(isContainedInBounds(2357,2448,774,867))
            buf = 5;
        else if(isContainedInBounds(2497,2592,742,832))
            buf = 5;
        
        
        //Zone3
        if(isContainedInBounds(2674,6816,0,1028))
            buf = getBaseline(3);
        //CO2 Emissions through thte years (zone3)
        if(isContainedInBounds(2688,2761,555,721))
            buf = 6;
        else if(isContainedInBounds(2766,2808,595,721))
            buf = 6;
        else if(isContainedInBounds(2766,2808,595,721))
            buf = 6;
        else if(isContainedInBounds(2818,2864,562,721))
            buf = 6;
        else if(isContainedInBounds(2860,2934,510,721))
            buf = 6;
        else if(isContainedInBounds(2934,3011,502,721))
            buf = 6;
        else if(isContainedInBounds(3011,3084,480,721))
            buf = 6;
        else if(isContainedInBounds(3011,3084,480,721))
            buf = 6;
        else if(isContainedInBounds(3084,3114,447,721))
            buf = 6;
        else if(isContainedInBounds(3084,3114,447,721))
            buf = 6;
        else if(isContainedInBounds(3114,3149,408,721))
            buf = 6;
        else if(isContainedInBounds(3149,3192,356,721))
            buf = 6;
        else if(isContainedInBounds(3192,3296,308,721))
            buf = 6;
        else if(isContainedInBounds(3192,3296,308,721))
            buf = 6;
        else if(isContainedInBounds(3296,3364,325,721))
            buf = 6;
        else if(isContainedInBounds(3364,3445,284,721))
            buf = 6;
        else if(isContainedInBounds(3445,3553,231,721))
            buf = 6;
        else if(isContainedInBounds(3553,3630,80,721))
            buf = 6;
        else if(isContainedInBounds(3630,3599,20,721))
            buf = 6;
        //Baseline water stress
        if(isContainedInBounds(2673,2764,649,742))
            buf = 5;
        else if(isContainedInBounds(2717,2810,441,532))
            buf = 5;
        else if(isContainedInBounds(2864,2954,532,623))
            buf = 5;
        else if(isContainedInBounds(3112,3199,573,667))
            buf = 5;
        else if(isContainedInBounds(3338,3429,480,573))
            buf = 5;
        if(isContainedInBounds(7108,7336,35,154))
            buf = 19;
        else if(isContainedInBounds(7138,7238,154,213))
            buf = 19;
        else if(isContainedInBounds(7953,8047,18,102))
            buf = 19;
        else if(isContainedInBounds(7916,8015,75,174))
            buf = 19;
        else if(isContainedInBounds(8005,8095,95,195))
            buf = 19;

        //Zone4
        if(isContainedInBounds(6816,9473,0,1028))
            buf = getBaseline(4);
        //Zone5
        if(isContainedInBounds(9473,10176,0,1028))
            buf = getBaseline(5);
        if(isContainedInBounds(10249,10325,285,434))
            buf = 32;
        else if(isContainedInBounds(10331,10427,264,434))
            buf = 32;
    return buf;
}

