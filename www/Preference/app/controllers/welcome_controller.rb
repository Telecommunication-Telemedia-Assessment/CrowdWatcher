class WelcomeController < ApplicationController
  def index
    session[:current_index] = 0
    session[:sequence_voted] = Array.new
  end
end
