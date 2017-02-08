class WelcomeController < ApplicationController
  def index

    @visit = Visit.new
    session[:foo] = 1

    @visit.u_id = request.session_options[:id]
    session[:u_id]   = @visit.u_id

    if !params[:mwid].nil? then
      postfix = ""
      if params[:mwid] == "testuser" then
        postfix = Time.now.to_i.to_s
      end
      session[:mw_id] = params[:mwid] + postfix
      session[:u_id] = session[:mw_id]
      @visit.u_id = session[:u_id]
      @visit.mw_id = params[:mwid] + postfix
    end
    if !params[:camp].nil? then
      session[:campid] = params[:camp]
    else
      session[:campid] = "notrealcampid"
    end

    if !params[:rnd].nil? then
      session[:rnd_key] = params[:rnd]
    else
      session[:rnd_key] = "notrealcampid"
    end

    @visit.save

  end
end
