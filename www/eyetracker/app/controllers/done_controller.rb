class DoneController < ApplicationController

@@microworker_vcode = "e3128f15ed35258cc36b85170fc5c0760f8dd5708d7b1bdaa8e9fa1bb41fba05"

def index
  @token = nil
  complete = false

  # simple test to check wether the participant is jumping to the end of the test: he should have at least filled the post session assessment.  
  if(PostSessionAssessment.where(:user_id => session[:u_id]).count > 0)
    complete = true
  end

  if(nil != session[:u_id])
    if !session[:mw_id].nil? then
      @token = ("mw-" + Digest::SHA256.hexdigest(session[:campid].to_s + session[:mw_id].to_s + @@microworker_vcode).to_s) unless !complete
    end
  end

end

end
