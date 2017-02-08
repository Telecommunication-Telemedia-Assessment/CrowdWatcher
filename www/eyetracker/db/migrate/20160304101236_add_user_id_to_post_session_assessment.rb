class AddUserIdToPostSessionAssessment < ActiveRecord::Migration
  def change
    add_column :post_session_assessments, :user_id, :string
  end
end
