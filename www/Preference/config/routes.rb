Rails.application.routes.draw do
  get 'pair_comparison_votes/new'

  get 'welcome/index'
  get 'done/done'

  resources :pair_comparison_votes
  

  root 'welcome#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
