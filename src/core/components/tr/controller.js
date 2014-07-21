{
  a : 1,
  b : "abc",
  c : function (argument) {
    this.param.a = {x:1,y:2};
    this.childType = (this.childType == "core/components/test2") ? "core/components/test1" : "core/components/test2";
  }
}