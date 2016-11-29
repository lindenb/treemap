var SVG="http://www.w3.org/2000/svg";

function Column(owner,index,name) {
	this.owner=owner;
	this.index = index;
	this.name=name;
	this.regex=null;
	this.tr = document.createElement("tr");
	
	var td = document.createElement("th");
	this.tr.appendChild(td);
	
	
	var lbl= document.createElement("label");
	lbl.setAttribute("for","filterc"+index);
	lbl.appendChild(document.createTextNode(name));
	td.appendChild(lbl);
	
	td = document.createElement("td");
	this.tr.appendChild(td);
	
	this.cbox = document.createElement("input");
	this.cbox.setAttribute("type","checkbox");
	td.appendChild(this.cbox);
	
	td = document.createElement("td");
	this.tr.appendChild(td);
	
	this.input = document.createElement("input");
	td.appendChild(this.input);
	this.input.setAttribute("id","filterc"+index);
	this.input.setAttribute("type","text");
	this.input.setAttribute("placeholder","regex");
	this.input.setAttribute("style","border: 1px solid black;");
	var that = this;
	this.input.addEventListener("change",function() {
		that.updatePattern();
		});
	
	td.appendChild(document.createTextNode(" "));
	var but = document.createElement("button");
	but.appendChild(document.createTextNode("Autofill"));
	td.appendChild(but);
	but.addEventListener("click",function() {
		var sw = "";
		var values={};
		for(var i in that.owner.rows)
			{
			values[ that.owner.rows[i].data[that.index] ]=1;
			}
		for(var i in values)
			{
			sw+=(sw==""?"^(":"|");
			/* http://stackoverflow.com/questions/3561493 */
			sw+=i.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			}
		sw+=")$";
		that.input.value=sw;
		that.updatePattern();
		});
	td.appendChild(document.createTextNode(" "));
	but = document.createElement("button");
	but.appendChild(document.createTextNode("Clear"));
	td.appendChild(but);
	but.addEventListener("click",function() {
		that.input.value="";
		that.updatePattern();
		});
	}

Column.prototype.getName = function() { return this.name;}
Column.prototype.getLabel = function() { return this.getName();}
Column.prototype.accept = function(s) { return this.regex==null || !this.regex.test(s) == this.cbox.checked ; }
Column.prototype.updatePattern = function() {
	this.regex = null;
	this.input.setAttribute("style","border: 1px solid black;");
	try {
		
		if(this.input.value!="")
			{
			this.regex = new RegExp(this.input.value);
			}
		}
	catch(err)
		{
		consolog.log("Bad regex :"+this.input.value+" "+err);
		this.input.setAttribute("style","border: 1px solid red;");
		this.regex = null;
		}
	}

function Row(owner,index,data) {
	this.owner=owner;
	this.index = index;
	this.data = data;
	}

function Selector(owner,index) {
	this.owner=owner;
	this.index = index;

	
	this.label = document.createElement("label");
	this.label.setAttribute("for","cat"+i);
	this.label.appendChild(document.createTextNode("Category  n°"+(index+1)));
	
	this.select = document.createElement("select");
	this.select.setAttribute("class","selcol");
	this.select.setAttribute("id","cat"+i);
	this.select.setAttribute("name","cat"+i);
	
	var opt = document.createElement("option");
	this.select.appendChild(opt);
	opt.setAttribute("class","optcol");
	opt.setAttribute("value","");
	opt.setAttribute("selected","true");
	opt.setAttribute("label","--");
	opt.appendChild(document.createTextNode("--"));
	
	for(var i=0;i< owner.getColumnCount()-1;++i)
		{
		var col = owner.getColumn(i);
		
		opt = document.createElement("option");
		this.select.appendChild(opt);
		opt.setAttribute("value","");
		opt.setAttribute("label",col.getLabel());
		opt.appendChild(document.createTextNode(col.getName()));		
		}
	
	}


function Spreadsheet()
	{
	this.columns=null;
	this.rows=[];
	this.selectors = [];
	}

Spreadsheet.prototype.getColumns = function() { return this.columns;}
Spreadsheet.prototype.getColumnCount = function() { return this.getColumns().length;}
Spreadsheet.prototype.getColumn = function(idx) { if(idx<0 || idx>= this.getColumnCount()) throw "Column index out of range:"+i; return this.getColumns()[idx];}

Spreadsheet.parse = function(content)
	{
	var lines= content.split(/[\n]/);
	
	var sheet = new Spreadsheet();
	for(i=0;i < lines.length;i++)
		{
		if(lines[i].length==0) continue;
		var tokens=lines[i].split(/\t/);

		if( sheet.columns == null )
			{
			if(tokens.length<=1) throw "Not enough tokens  ("+tokens.length+") line "+(i+1);
			sheet.columns = [];
			for(var c in tokens)
				{
				sheet.columns.push( new Column(sheet,c,tokens[c]) );
				}
			}
		else {
		     if( tokens.length != sheet.columns.length)
		     	{
		     	throw "Not enough columns line "+(i+1)+" expected "+sheet.columns.length+" got "+ tokens.length+" "+lines[i];
		     	}
		     var last = tokens[  tokens.length -1 ];
		     if(Number.isNaN(parseFloat(last)) ) {
		   	  throw "Not a number in last column:\""+last+"\"";
		     	}
		     sheet.rows.push(new Row(sheet,sheet.rows.length,tokens));
		     }
		}
	if(sheet.rows.length==0) throw "Not enough rows.";
	
	for(var i=0;i< sheet.getColumnCount()-1 && i<5;++i)
		{
		sheet.selectors.push( new Selector(sheet,sheet.selectors.length));
		}
	
	return sheet;
	}



function Rectangle() {
	this.x=0;
	this.y=0;
	this.width=0;
	this.height=0;
	if(arguments.length==4)
		{
		this.x = arguments[0];
		this.y = arguments[1];
		this.width  = arguments[2];
		this.height = arguments[3];
		}
	else if(arguments.length==1)
		{
		this.x = arguments[0].x;
		this.y = arguments[0].y;
		this.width  = arguments[0].width;
		this.height = arguments[0].height;
		}
	}

Rectangle.prototype.getWidth = function()  { return this.width;}
Rectangle.prototype.getHeight = function()  { return this.height;}
Rectangle.prototype.getX = function()  { return this.x;}
Rectangle.prototype.getY = function()  { return this.y;}
Rectangle.prototype.inset = function (ratio) {
	if( arguments.length == 0) { return this.inset(0.9);}
	var r1_width= this.getWidth()*ratio;
	var r1_x= this.getX()+(this.getWidth()-r1_width)/2.0;
	var r1_height= this.getHeight()*ratio;
	var r1_y= this.getY()+(this.getHeight()-r1_height)/2.0;
	return new Rectangle(r1_x,r1_y,r1_width,r1_height);
	}
Rectangle.prototype.getMidX = function()  { return (this.getX()+this.getWidth()/2.0);};
Rectangle.prototype.getMidY = function()  { return (this.getY()+this.getHeight()/2.0);};
Rectangle.prototype.getCenterX = function()  { return this.getMidX();};
Rectangle.prototype.getCenterY = function()  { return  this.getMidY();};
Rectangle.prototype.getMaxY = function() { return this.getY()+this.getHeight();};

Rectangle.prototype.toString = function()  { return  "x="+this.x+",y="+this.y+",w="+this.width+",h="+this.height;};

function Orientation() {}
Orientation.VERTICAL=0;
Orientation.HORIZONTAL=1;

function Direction() {}
Direction.ASCENDING=0;
Direction.DESCENDING=1;


function TreePack()
	{
	this.name="";
	this.category="";
	this.parent=null;
	this.children={};
	this.bounds = new Rectangle();
	this.weight=0;
	}

TreePack.prototype.setBounds = function(bounds)	 {
	this.bounds  = bounds;
	};

TreePack.prototype.getBounds= function() {
	return this.bounds;
	};

TreePack.prototype.getWeight= function() {
	if(this.isLeaf() )
		{
		return this.weight;
		}
	else
		{
		var w= 0.0;
		for(var r  in this.children)
			{
			w += this.children[r].getWeight();
			}
		if( w==0.0) throw "getWi:weight == 0!!!";
		return w;
		}
	};


TreePack.prototype.isLeaf = function() {
	for(var k in this.children) return false;
	return true;
	};

TreePack.prototype.getDepth = function() {
	var n=0;
	var curr= this;
	while(curr.parent!=null)
		{
		curr=curr.parent;
		n++;
		}
	return n;
	};



TreePack.prototype.getTitleFrame=function()
	{
	var r= this.bounds; 
	var frame= new Rectangle();
	frame.height=r.getHeight()*0.1;
	frame.y=r.getY();
	frame.width=r.getWidth();
	frame.x=r.getX();
	return frame.inset(0.9);
	};
		
TreePack.prototype.getChildrenFrame = function()
	{
	var r= this.bounds; 
	var frame= new Rectangle();
	frame.height=r.getHeight()*0.9;//yes again after
	frame.y=r.getMaxY()-frame.height;
	frame.height=r.getHeight()*0.85;//yes again 
	frame.width=r.getWidth()*0.95;
	frame.x=r.getX()+(r.getWidth()-frame.width)/2.0;
	return frame;
	};


TreePack.prototype.svg = function(packer) {
	var hershey = new Hershey();
	
	if( this.parent == null)
		{
		var svg = document.createElementNS(SVG,"svg:svg");
		svg.setAttribute("width",this.bounds.width);
		svg.setAttribute("height",this.bounds.height);
		
		
		var defs = document.createElementNS(SVG,"svg:defs");
		svg.appendChild(defs);
		
		var style = document.createElementNS(SVG,"svg:style");
		style.setAttribute("type","text/css");
		style.appendChild(document.createTextNode(
			"svg {fill:none;stroke:black;stroke-width:0.5px;}\n"+
			".r0 {fill:rgb(240,240,240);stroke:black;stroke-width:0.5px;}\n"+
			".r1 {fill:rgb(220,220,220);stroke:black;stroke-width:0.5px;}\n"+
			".lbla0 {stroke:black;stroke-width:1px;}\n"+
			".lblb0 {stroke:red;stroke-width:1px;}\n"+
			".lbla1 {stroke:gray;stroke-width:1px;}\n"+
			".lblb1 {stroke:red;stroke-width:1px;}\n"+
			""
			));

		defs.appendChild(style);
		
		var title = document.createElementNS(SVG,"svg:title");
		title.appendChild(document.createTextNode("TreeMap"));
		svg.appendChild(title);
		
		var rect =  document.createElementNS(SVG,"svg:rect");
		rect.setAttribute("x",0);
		rect.setAttribute("y",0);
		rect.setAttribute("width",(this.bounds.width-1));
		rect.setAttribute("height",(this.bounds.height-1));
		rect.setAttribute("style","fill:white;stroke:black;");
		svg.appendChild(rect);
	
		
		var g = document.createElementNS(SVG,"svg:g");
		svg.appendChild(g);
		
		var L = [];
		for(var k in this.children) L.push(this.children[k]);
	        packer.layout2(L,this.bounds);
		
		for(var c in L)
			{
			var d = L[c].svg(packer);
			if(d==null) continue;
			g.appendChild(d);
			}
		
		rect =  document.createElementNS(SVG,"svg:rect");
		rect.setAttribute("x",0);
		rect.setAttribute("y",0);
		rect.setAttribute("width",(this.bounds.width-1));
		rect.setAttribute("height",(this.bounds.height-1));
		rect.setAttribute("style","fill:none;stroke:black;");
		svg.appendChild(rect);
	        
		return svg;
		}
	else
		{
		
		if(this.getWeight()<=0)
			   {
			   return null;
			   }
		
		   var bounds = this.getBounds();
		   var insets = bounds.inset(0.9);
		   var frameUsed=bounds;
		   
		   
		   if(bounds.getWidth()<=1 || bounds.getHeight()<=1)
			   {
			   return null;
			   }
		   var g = document.createElementNS(SVG,"svg:g");

		   
		   

		   var rect =  document.createElementNS(SVG,"svg:rect");
		   g.appendChild(rect);
		   rect.setAttribute("x",frameUsed.x);
   		   rect.setAttribute("y",frameUsed.y);
   		   rect.setAttribute("width",frameUsed.width);
   		   rect.setAttribute("height",frameUsed.height);
   		   rect.setAttribute("class", "r"+(this.getDepth()%2));
   		   var title = document.createElementNS(SVG,"svg:title");
   		   rect.appendChild(title);
   		   title.appendChild( document.createTextNode(this.category+":"+this.name+"="+this.getWeight()));

		
		   if(!this.isLeaf())
			   {
			   var path =  document.createElementNS(SVG,"svg:path");
			   path.setAttribute("style","stroke:black;fill:none;");
			   path.setAttribute("d", hershey.svgPath(this.name+"="+this.getWeight(), this.getTitleFrame()) );
			   path.setAttribute("title",this.category+":"+this.name+"="+this.getWeight());

			   g.appendChild(path);
			   
			   
			   
			   var L = [];
			   for(var k in this.children) L.push(this.children[k]);
	                   packer.layout2(L,this.getChildrenFrame());
			   
			   for(var c in L)
				{
				var d = L[c].svg(packer);
				if(d==null) {
					continue;
					}
				g.appendChild(d);
				}
			   
			   }
		   else
			   {

			  
			   	var f_up= new Rectangle(
			   			insets.getX(),insets.getY(),
			   			insets.getWidth(),insets.getHeight()/2.0
			   			).inset(0.9);
			   	var p1= document.createElementNS(SVG,"svg:path");
			   	 g.appendChild(p1);
			   	p1.setAttribute("class","lbla"+(this.getDepth()%2));
				p1.setAttribute("d",hershey.svgPath(this.name,f_up));
				p1.setAttribute("style","stroke-width:"+ 
					(3.0/(this.getDepth()+1) )
					);

				var f_down=new Rectangle(
						insets.getX(),insets.getCenterY(),
						insets.getWidth(),insets.getHeight()/2.0
			   			);
			   	var p2= document.createElementNS(SVG,"svg:path");
			   	p2.setAttribute("class","lblb"+(this.getDepth()%2));
			   	p2.setAttribute("d",hershey.svgPath(""+this.getWeight(),f_down));
			   	g.appendChild(p2);
			   	 
				//w.writeAttribute("d", hershey.svgPath(convertWeightToString(),f_down) );
				//w.writeAttribute("class","lblb"+(getDepth()%2));
			   }
		   
		   return g;
		   }
	};
	

function Packer() {
	}
	
    
Packer.prototype.layout2 = function(items,bounds)
	{
	var L = this.sortDescending(items);
     	this.layout4(L,0,L.length-1,bounds);
	};
    
Packer.prototype.sum= function(items,  start, end)
    {
    var sum=0.0;
    while(start<=end)//yes <=
    	{
    	var w = items[start++].getWeight();
    	sum+=w;
    	}
    return sum;
    };
	
Packer.prototype.sortDescending = function(items)
    {
    var L= items.slice();
    L.sort(function(pack1,pack2) {
    	var w1= pack1.getWeight();
	var w2= pack2.getWeight();
	if(w1<w2) return -1;
	if(w1>w2) return 1;
	return 0;
    	});
    return L;
    };
	
Packer.prototype.layout4 = function(items,  start,  end, bounds)
    {
    
        if (start>end) return;
            
        if (end-start<2)
        {
            this.layoutBest(items,start,end,bounds);
            return;
        }
        
        var x= bounds.getX(), y=bounds.getY(), w=bounds.getWidth(), h=bounds.getHeight();
        
        var total= this.sum(items, start, end);
        var mid=start;
        var a= items[start].getWeight()/total;
        var b = a;
        
        if (w<h)
        {
            // height/width
            while (mid<=end)
            {
                var aspect= this.normAspect(h,w,a,b);
                var q=items[mid].getWeight()/total;
                if (this.normAspect(h,w,a,b+q) > aspect) break;
                mid++;
                b+=q;

            }

            this.layoutBest(items,start,mid,new Rectangle(x,y,w,h*b));
            this.layout4(items,mid+1,end, new Rectangle(x,y+h*b,w,h*(1-b)));
        }
        else
        {
            // width/height
            while (mid<=end)
            {
                var aspect= this.normAspect(w,h,a,b);
                var q=items[mid].getWeight()/total;
                if ( this.normAspect(w,h,a,b+q)>aspect) break;
                mid++;
                b+=q;
            }
           this.layoutBest(items,start,mid, new Rectangle(x,y,w*b,h));
           this.layout4(items,mid+1,end, new Rectangle(x+w*b,y,w*(1-b),h));
        }   
    };
    
Packer.prototype.aspect = function( big,  small,  a,  b)
    {
        return (big*b)/(small*a/b);
    };
    
Packer.prototype.normAspect = function( big,  small,  a,  b)
    {
        var x= this.aspect(big,small,a,b);
        if (x<1.0) return 1.0/x;
        return x;
    };

Packer.prototype.layoutBest = function( items,  start,  end,  bounds)
    {
    this.sliceLayout(
    	    items,start,end,bounds,
            bounds.getWidth()>bounds.getHeight() ? Orientation.HORIZONTAL : Orientation.VERTICAL,
            Direction.ASCENDING
            );
    };
    
    

Packer.prototype.sliceLayout = function(items,  start,  end,  bounds,  orientation,  order)
        {
            var total= this.sum(items, start, end);
            var a=0.0;
            var vertical=(orientation==Orientation.VERTICAL);
           
            for (var i=start; i<=end; i++)
            {
            	var  r = new Rectangle();

                var b=items[i].getWeight()/total;
                if (vertical)
                {
                    r.x=bounds.getX();
                    r.width=bounds.getWidth();
                    if (order==Direction.ASCENDING)
                    	{
                        r.y=bounds.getY()+bounds.getHeight()*a;
                        }
                    else
                    	{
                        r.y=bounds.getY()+bounds.getHeight()*(1-a-b);
                        }
                    r.height=bounds.getHeight()*b;
                }
                else
                {
                    if (order==Direction.ASCENDING)
                    	{
                        r.x=bounds.getX()+bounds.getWidth()*a;
                        }
                    else
                    	{
                        r.x=bounds.getX()+bounds.getWidth()*(1-a-b);
                        }
                    r.width=bounds.getWidth()*b;
                    r.y=bounds.getY();
                    r.height=bounds.getHeight();
                }
     		
                items[i].setBounds(r);
                a+=b;
            }
        }

