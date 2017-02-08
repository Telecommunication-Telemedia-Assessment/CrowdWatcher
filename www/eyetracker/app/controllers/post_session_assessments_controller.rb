class PostSessionAssessmentsController < ApplicationController

  def new
    @post_session_assessment = PostSessionAssessment.new
  end

  def create
    @post_session_assessment = PostSessionAssessment.new(params[:post_session_assessment].permit(:final_emotion, :comfort, :feedback))
    @post_session_assessment.user_id = session[:u_id]

    respond_to do |format|
      if @post_session_assessment.save
        format.html {redirect_to :controller => 'done', :action => 'index' }
      else
        format.html { render action: "new" }
      end
    end
  end

end
