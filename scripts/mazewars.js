'use strict';

window.onload = function()
{
	let game = new cGame(gameCanvas);
	game.start();
}


class cGame
{
	constructor(canvas)
	{
		this.setState("Start");
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		let that = this;
		window.addEventListener("resize", function(){that.resize();});
		this.resize();

	}

	resize()
	{
		let h = window.innerHeight;
		let w = window.innerWidth;
		this.canvas.style.height = h + 'px';
		this.canvas.style.width  = w + 'px';
		this.canvas.height = h;
		this.canvas.width  = w;
	}

	setState(newState)
	{
		if (this.state)
			console.log("State: [" + this.state + "] => [" + newState + "]");
		else
			console.log("State: [" + newState + "]");
		this.state = newState;
	}

	start()
	{
		this.setState("Load");
		
	}
}

/*
//-------CONST-------//
CONST cz0 = 25;
      mpg = 200;
      di     : array [0..3] of shortint = (0,-1,0,1);
      dj     : array [0..3] of shortint = (1,0,-1,0);
      dx     : array [0..3] of shortint = (cz0,cz0-1,0,1);
      dy     : array [0..3] of shortint = (cz0-1,0,1,cz0);
      opp    : array [0..3] of byte     = (2,3,0,1);
      next   : array [0..3] of byte     = (1,2,3,0);
      colors : array [0..5] of word     = (Black,Blue,Red,Green,Yellow,Cyan);
      
      NObjects = 3;
      Spawner = 1;
      Pointer = 2;
      Mine    = 3;
//-------CONST-------//

//-------FIELD-------//
TYPE TLocation = Record
         t,f,p : integer;
         w : array [0..3] of PBoolean
     End;
     TGlider = Record
         fr,i1,j1,i2,j2,d1,d2 : integer;
     End;
     TGliderArray = array of TGlider;
     TSpawner = Record
         
     End;
     TField = array of array of TLocation;
     
Var F : TField;
    G : TGliderArray;
    m,n,cz,e : integer;
    t : double;

Function InField(i,j : integer) : boolean;
Begin
   InField:=(i in [0..m-1]) and (j in [0..n-1])
End;

Function TypeIs(t,i,j : integer) : boolean;
Begin
   TypeIs:=InField(i,j) and (F[i,j].t=-1)
End;
//-------FIELD-------//

//-------INITIALIZATION-------//
Procedure SetFieldSize(var F : TField; m,n : integer);
Var i,j,ni,nj,d : integer;
Begin
   SetLength(F,m,n);
   
   for i:=0 to m-1 do 
   for j:=0 to n-1 do begin
      F[i,j].t:=0;
      for d:=0 to 3 do
      F[i,j].w[d]:=nil
   end;
   
   for i:=0 to m-1 do
   for j:=0 to n-1 do
   for d:=0 to 3 do begin
      ni:=i + di[d];
	  nj:=j + dj[d];
	  if not (InField(ni,nj)) then begin
	     GetMem(F[i,j].w[d],1);
	     F[i,j].w[d]^:=true
	  end
	  else if (F[i,j].w[d]=nil) then begin
	     GetMem(F[i,j].w[d],1);
	     F[ni,nj].w[opp[d]]:=F[i,j].w[d];
	     F[i,j].w[d]^:=false
	  end
   end
End;

Procedure FillField(var F : TField; t : integer; bool : boolean);
Var i,j,d,ni,nj : integer;
Begin
   for i:=0 to m-1 do
   for j:=0 to n-1 do begin
      F[i,j].t:=t;
      for d:=0 to 3 do 
      if ((F[i,j].w[d]^) xor (bool)) then begin
         ni:=i + di[d];
   	  nj:=j + dj[d];
	     if InField(ni,nj) then
   	  F[i,j].w[d]^:=bool
      end
   end
End;

Procedure UpdateSize(ncz : integer);
Begin
	cz:=ncz;//New cell size
	m:=479 div cz;//Height
	n:=639 div cz;//Width
	SetFieldSize(F,m,n)
End;

Procedure Init;
Var gm,gd : integer;
Begin
	Randomize;
	gd:=detect;
	//gm:=m1024x768;
	InitGraph(gd,gm,'');
	UpdateSize(cz0)
End;
//-------INITIALIZATION-------//

//-------GRAPHICS-------//
Procedure RenderDots;
Var i,j : integer;
Begin
	for i:=0 to m do
	for j:=0 to n do
	PutPixel(cz*j,cz*i,LightGray)
End;

Procedure RenderWall(i,j,d : integer);
Var x0,y0 : integer;
Begin
	if F[i,j].w[d]^ then
	SetColor(LightGray)
	else
	SetColor(Black);
	
	x0:=j*cz + dx[d];
	y0:=i*cz + dy[d];
	
	Line(x0, y0, x0 + dj[next[d]]*(cz-2), y0 + di[next[d]]*(cz-2))
End;

Procedure RenderCenter(i,j : integer);
Var x0,y0 : integer;
Begin
	x0:=j*cz;
	y0:=i*cz;
	if (F[i,j].t=1) then begin
		SetColor(Colors[F[i,j].f]);
		Rectangle(x0+1+(cz-1) div 4,y0+1+(cz-1) div 4,x0+cz-1-(cz-1) div 4,y0+cz-1-(cz-1) div 4)
	end;
End;

Procedure RenderLocation(i,j : integer);//redo
Var d : integer;
Begin
	RenderCenter(i,j);
	
	for d:=0 to 3 do 
	RenderWall(i,j,d)
End;

Procedure RenderField;
Var i,j : integer;
Begin
	RenderDots;
	for i:=0 to m-1 do
	for j:=0 to n-1 do
	RenderLocation(i,j)
End;

Procedure RenderGlider(i : integer;t : double);
Var x,y,a : double;
    x1,y1,x2,y2,x3,y3,a1,a2 : integer;
Begin
	with G[i] do begin
		SetColor(Colors[fr]);
		
		x:=cz*(j1 + (j2-j1)*t + 0.5);
		y:=cz*(i1 + (i2-i1)*t + 0.5);
		if (d2-d1 > 2) then
		a:=(d1 + (d2-4-d1)*t)*pi/2
		else if (d1-d2 > 2) then
		a:=(d1 + (d2-d1+4)*t)*pi/2
		else
		a:=(d1 + (d2-d1)*t)*pi/2
	end;
	
	x1:=round(x + cz/3*cos(3*pi/4 + a));
	y1:=round(y - cz/3*sin(3*pi/4 + a));
	x2:=round(x + cz/3*cos(a));
	y2:=round(y - cz/3*sin(a));
	x3:=round(x + cz/3*cos(-3*pi/4 + a));
	y3:=round(y - cz/3*sin(-3*pi/4 + a));
	
	Line(x1,y1,x2,y2);
	Line(x3,y3,x2,y2);
	Line(x1,y1,x3,y3);
End;

Procedure RenderGlider(i : integer);
Begin
	RenderGlider(i,t)
End;

Procedure RenderGliders;
Var i : integer;
Begin
	for i:=0 to high(G) do 
	RenderGlider(i)
End;

Procedure HideGlider(i : integer;t : double);
Var fr : integer;
Begin
	fr:=G[i].fr;
	G[i].fr:=0;
	RenderGlider(i,t);
	RenderCenter(G[i].i1,G[i].j1);
	RenderCenter(G[i].i2,G[i].j2);
	G[i].fr:=fr
End;

Procedure HideGlider(i : integer);
Begin
	HideGlider(i,t)
End;

Procedure HideGliders;
Var i : integer;
Begin
	for i:=0 to high(G) do 
	HideGlider(i)
End;

Procedure RenderAll(t : double);
Begin
	ClearDevice;
	RenderField;
	RenderGliders;
End;
//-------GRAPHICS-------//

//-------MAP GENERATION-------//
Procedure GenSpawners;
Var i,j,d,c : integer;
Begin
   for i:=0 to m-1 do
   for j:=0 to n-1 do begin
      c:=0;
      
      for d:=0 to 3 do
      if F[i,j].w[d]^ then
      c+=1;
      
      if (c > 2) then
      F[i,j].t:=Spawner;
   end
End;

Procedure GenMazeBacktracking;
Var i,j,ni,nj,d,c : integer;
    st : TList;
    data : TIntegerArray;
Begin
   FillField(F,-1,True);
   InitList(st);
   
   i:=random(m);
   j:=random(n);
   
   Repeat 
      F[i,j].t:=0;
      c:=0;
      
      for d:=0 to 3 do begin
         ni:=i + di[d];
         nj:=j + dj[d];
         if TypeIs(-1,ni,nj) then
         c+=1
      end;
      
      if (c = 0) then begin
         PopHead(st,PIntegerArray.create(@i,@j));
      end
      else begin
         c:=random(c) + 1;
         d:=-1;
         
         while (c > 0) do begin
            d+=1;
            ni:=i + di[d];
            nj:=j + dj[d];
            if TypeIs(-1,ni,nj) then
            c-=1;
         end;
         
         F[i,j].w[d]^:=false;
         PushHead(st,TIntegerArray.create(i,j));
         i:=ni;
         j:=nj
      end
   Until (st.head = nil);
   GenSpawners
End;

Procedure GMRD(i1,j1,i2,j2 : integer);
Var i,j,i0,j0,c : integer;
Begin
   if ((i2>i1)and(j2>j1)) then begin
      i0:=round(NormalDistribution(i1,i2-1));
      j0:=round(NormalDistribution(j1,j2-1));
      
      for i:=i1 to i2 do
      F[i,j0].w[0]^:=true;
      for j:=j1 to j2 do
      F[i0,j].w[3]^:=true;
      
      c:=random(4);
      if (c in [0,1,3]) then F[i0,j1+random(j0-j1+1)].w[3]^:=false;
      if (c in [0..2])  then F[i0,j0+1+random(j2-j0)].w[3]^:=false;
      if (c in [1..3])  then F[i1+random(i0-i1+1),j0].w[0]^:=false;
      if (c in [0,2,3]) then F[i0+1+random(i2-i0),j0].w[0]^:=false;
      
      GMRD(i1,j1,i0,j0);
      GMRD(i1,j0+1,i0,j2);
      GMRD(i0+1,j1,i2,j0);
      GMRD(i0+1,j0+1,i2,j2)
   end
End;

Procedure GenMazeRecursiveDivision;
Begin
	FillField(F,0,False);
	GMRD(0,0,m-1,n-1);
	GenSpawners
End;
//-------MAP GENERATION-------//

//-------//
Procedure Spawn(nBots : integer);
Var i,j,s,c,k : integer;
Begin
	c:=0;
	for i:=0 to m-1 do
	for j:=0 to n-1 do begin
		if (F[i,j].t = Spawner) then
		c+=1;
	end;
	
	for k:=1 to min(nBots,c) do begin
		s:=1 + random(c);
		i:=-1;
		while ((i < m)and(s > 0)) do begin
			i+=1;
			j:=-1;
			while ((j < n)and(s > 0)) do begin
				j+=1;
				if (F[i,j].t = Spawner) then
				s-=1
			end;
		end;
		F[i,j].f:=k;
		RenderCenter(i,j);
		c-=1
	end
End;

Function NotEndOfGame : boolean;//undone
Begin
	NotEndOfGame:=true
End;

Procedure AddGlider(i,j,d,fr : integer);
Var n : integer;
Begin
	n:=Length(G);
	SetLength(G,n+1);
	G[n].i1:=i;
	G[n].i2:=i;
	G[n].j1:=j;
	G[n].j2:=j;
	G[n].fr:=fr;
	G[n].d1:=d;
	G[n].d2:=d;
End;

Procedure DeleteGlider(i : integer);
Begin
	HideGlider(i);
	G[i]:=G[High(G)];
	SetLength(G,Length(G)-1)
End;

Procedure Move;//shitcode
Var i,j,d,c : integer;
Begin
	for i:=0 to m-1 do 
	for j:=0 to n-1 do
	if (((i+j) mod 2 = e)and(F[i,j].t=Spawner)and(F[i,j].f<>0)) then begin
		F[i,j].p-=2;
		if (F[i,j].p<=0) then begin
			AddGlider(i,j,0,F[i,j].f);
			F[i,j].p+=mpg
		end;
	end;
	
	i:=1;
	while (i<=High(G)) do begin
		j:=0;
		while (j<i) do begin
			if ((G[i].i2 = G[j].i2)and(G[i].j2 = G[j].j2)and(G[i].fr <> G[j].fr)) then begin
				DeleteGlider(i);
				DeleteGlider(j)
			end;
			j+=1
		end;
		i+=1
	end;
	
	i:=0;
	while (i<=High(G)) do with G[i] do begin
		if ((F[i2,j2].f<>fr)and(F[i2,j2].t=Spawner)) then begin
			F[i2,j2].f:=fr;
			DeleteGlider(i)
		end;
		i+=1
	end;
	
	for i:=0 to High(G) do with G[i] do begin
		if (F[i1,j1].w[d1]^) then repeat
		    d1:=(d1 + 1) mod 4;
		    d2:=d1
		until (not F[i1,j1].w[d1]^);
		i1:=i2;
		j1:=j2;
		d1:=d2;
		i2:=i1+di[d1];
		j2:=j1+dj[d1];
		
		{if (not F[i2,j2].w[(d1+3) mod 4]^) then
		d2:=(d1+3) mod 4
		else 
		if (F[i2,j2].w[d1]^) then begin
		if (not F[i2,j2].w[(d1+1) mod 4]^) then
		d2:=(d1+1) mod 4
		else 
		d2:=opp[d1]
		end}
		
		c:=0;
		for d:=0 to 3 do
		if (not F[i2,j2].w[d]^) then
		c+=1;
		
		if (c=1) then 
		d2:=opp[d1]
		else repeat
			d2:=random(4)
		until ((not F[i2,j2].w[d2]^)and(d2<>opp[d1]))
	end
End;

Procedure StartGame(nBots : byte; Player : boolean);
Var i,j : integer;
    t0 : double;
Begin
	GenMazeRecursiveDivision;
	RenderField;
	Spawn(nBots);
	while (NotEndOfGame) do begin
		e:=(e + 1) mod 2;
		t0 := 0;
		for i:=1 to fpm do begin
			t := i/fpm;
			for j:=0 to High(G) do Begin
				HideGlider(j,t0);
				RenderGlider(j,t)
			End;
			t0 := t
		end;
		Move
	end
End;
//---------//

BEGIN
   Init;
   StartGame(5,false)
END.
*/