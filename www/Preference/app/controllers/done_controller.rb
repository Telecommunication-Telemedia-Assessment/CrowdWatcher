class DoneController < ApplicationController

@@salt = "eb4bdf7876a4cb748878abc8e8243d5eb32fe89121f074b947759fa5b0329304"

def done
  @token = nil
  complete = false

  if(session[:current_index] >= 3)
    complete = true;
  end

  if(nil != session[:u_id])
    if !session[:mw_id].nil? then
      @token = ("mw-" + Digest::SHA256.hexdigest(session[:campid].to_s + session[:mw_id].to_s + @@salt).to_s) unless !complete
    end
  end

end


end
