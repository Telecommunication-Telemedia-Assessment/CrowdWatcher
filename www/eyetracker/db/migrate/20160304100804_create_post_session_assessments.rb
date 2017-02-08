class CreatePostSessionAssessments < ActiveRecord::Migration
  def change
    create_table :post_session_assessments do |t|
      t.integer :final_emotion
      t.integer :comfort
      t.string :feedback

      t.timestamps null: false
    end
  end
end
