{
  messages : [],
  dialog : {
    shouldShow : false
  },
  closeDialog : function(){
    this.dialog.shouldShow = false;
  },
  clearMessages : function(){
    this.messages.length = 0;
  },
  init : function () {
    var self = this;
    var latestMessageId = 1;

    this.services.$interval(function(){
      latestMessageId ++;
      var message = {
        id : latestMessageId,
        summary : " test message " + Math.floor(Math.random()*1000),
        code : (Math.random() > 0.5) ? "200" : "404",
        level : Math.floor(Math.random()*10),
        sender : "Instance " + Math.floor(Math.random()*100)
      }
      self.messages.push(message);
      if(!self.dialog.shouldShow){
        self.dialog.shouldShow = (Math.random() > 0.5);
      }
      
    }, 5000);
  }
}