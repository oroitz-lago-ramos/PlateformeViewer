mergeInto(LibraryManager.library, {

  // Called after rooms are loaded — sends the full room list to React
  SendRoomsToWeb: function(jsonPtr) {
    var json = UTF8ToString(jsonPtr);
    window.dispatchEvent(new CustomEvent('unityRoomsLoaded', { detail: json }));
  },

  // Called when the user clicks a room — sends the selected room to React
  SendRoomSelectedToWeb: function(jsonPtr) {
    var json = UTF8ToString(jsonPtr);
    window.dispatchEvent(new CustomEvent('unityRoomSelected', { detail: json }));
  }

});
