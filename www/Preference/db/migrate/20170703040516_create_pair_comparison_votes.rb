class CreatePairComparisonVotes < ActiveRecord::Migration[5.0]
  def change
    create_table :pair_comparison_votes do |t|
      t.integer :vote
      t.integer :a
      t.integer :b
      t.string :user_id

      t.timestamps
    end
  end
end
